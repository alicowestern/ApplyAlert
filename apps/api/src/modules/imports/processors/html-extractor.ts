/**
 * HTML text extraction using cheerio.
 *
 * Extracts meaningful human-readable text from HTML pages:
 * - Title, meta description, canonical URL
 * - Article/main content preferred
 * - Headings, paragraphs, lists preserved as sections
 * - Scripts, styles, nav, cookie banners removed
 * - Links collected as metadata
 */

import * as cheerio from 'cheerio';
import type { ContentSection, DiscoveredLink } from '@applyalert/contracts';

export interface HtmlExtractionResult {
  title: string | null;
  metaDescription: string | null;
  canonicalUrl: string | null;
  sections: ContentSection[];
  links: DiscoveredLink[];
  fullText: string;
}

/** Tags to completely remove (including content) */
const REMOVE_TAGS = ['script', 'style', 'noscript', 'iframe', 'svg', 'canvas'];

/** Tags considered navigation/noise */
const NOISE_SELECTORS = [
  'nav', 'header', 'footer',
  '[role="navigation"]', '[role="banner"]', '[role="contentinfo"]',
  '.cookie-banner', '.cookie-consent', '#cookie-banner',
  '.navbar', '.nav-bar', '.site-header', '.site-footer',
  '.sidebar', 'aside',
];

export function extractHtml(html: string, baseUrl?: string): HtmlExtractionResult {
  const $ = cheerio.load(html);

  // Extract metadata first
  const title = $('title').first().text().trim() || null;
  const metaDescription =
    $('meta[name="description"]').attr('content')?.trim() ||
    $('meta[property="og:description"]').attr('content')?.trim() ||
    null;
  const canonicalUrl =
    $('link[rel="canonical"]').attr('href')?.trim() ||
    $('meta[property="og:url"]').attr('content')?.trim() ||
    null;

  // Remove noise
  for (const tag of REMOVE_TAGS) {
    $(tag).remove();
  }
  for (const selector of NOISE_SELECTORS) {
    $(selector).remove();
  }

  // Remove hidden elements
  $('[style*="display:none"], [style*="display: none"], [hidden], [aria-hidden="true"]').remove();

  // Try to find main content area
  const mainContent = $('main, article, [role="main"], .content, .main-content, #content, #main').first();
  const contentRoot = mainContent.length ? mainContent : $('body');

  // Extract sections from headings
  const sections: ContentSection[] = [];
  const headings = contentRoot.find('h1, h2, h3, h4, h5, h6');

  if (headings.length > 0) {
    headings.each((_, el) => {
      const heading = $(el).text().trim();
      // Collect text until next heading
      let text = '';
      let next = $(el).next();
      while (next.length && !next.is('h1, h2, h3, h4, h5, h6')) {
        const blockText = next.text().trim();
        if (blockText) {
          text += blockText + '\n';
        }
        next = next.next();
      }

      if (heading || text.trim()) {
        sections.push({
          heading: heading || null,
          text: text.trim(),
          sourceRef: baseUrl || null,
        });
      }
    });
  }

  // If no heading-based sections, create a single section from full content
  if (sections.length === 0) {
    const bodyText = extractCleanText($, contentRoot);
    if (bodyText.trim()) {
      sections.push({
        heading: title,
        text: bodyText.trim(),
        sourceRef: baseUrl || null,
      });
    }
  }

  // Extract links
  const links: DiscoveredLink[] = [];
  contentRoot.find('a[href]').each((_, el) => {
    const text = $(el).text().trim();
    let href = $(el).attr('href') || '';

    // Resolve relative URLs
    if (baseUrl && href && !href.startsWith('http') && !href.startsWith('mailto:') && !href.startsWith('#')) {
      try {
        href = new URL(href, baseUrl).toString();
      } catch {
        // Skip unresolvable URLs
      }
    }

    if (text && href && (href.startsWith('http://') || href.startsWith('https://'))) {
      links.push({ text, href });
    }
  });

  // Build full text from sections
  const fullText = sections
    .map(s => [s.heading, s.text].filter(Boolean).join('\n'))
    .join('\n\n')
    .trim();

  return {
    title,
    metaDescription,
    canonicalUrl,
    sections,
    links: deduplicateLinks(links),
    fullText,
  };
}

function extractCleanText($: cheerio.CheerioAPI, root: cheerio.Cheerio<any>): string {
  const lines: string[] = [];

  root.find('p, li, td, th, dt, dd, blockquote, pre, div').each((_, el) => {
    const text = $(el)
      .clone()
      .children('p, li, td, th, dt, dd, blockquote, pre, div')
      .remove()
      .end()
      .text()
      .trim();
    if (text) {
      lines.push(text);
    }
  });

  if (lines.length === 0) {
    return root.text().trim();
  }

  return lines.join('\n');
}

function deduplicateLinks(links: DiscoveredLink[]): DiscoveredLink[] {
  const seen = new Set<string>();
  return links.filter(link => {
    if (seen.has(link.href)) return false;
    seen.add(link.href);
    return true;
  });
}
