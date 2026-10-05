import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import type { ContentSection, DiscoveredLink, ImportErrorCode } from '@applyalert/contracts';
import { SsrfGuard } from './ssrf-guard';
import { extractHtml, type HtmlExtractionResult } from './html-extractor';

export interface UrlProcessingResult {
  finalUrl: string;
  normalizedText: string;
  contentHash: string;
  title: string | null;
  metaDescription: string | null;
  sections: ContentSection[];
  links: DiscoveredLink[];
}

export class UrlProcessingError extends Error {
  constructor(
    public readonly code: ImportErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'UrlProcessingError';
  }
}

const DEFAULT_TIMEOUT_MS = 10_000;
const MAX_RESPONSE_BYTES = 5 * 1024 * 1024; // 5MB
const MAX_REDIRECTS = 5;

const ALLOWED_CONTENT_TYPES = [
  'text/html',
  'application/xhtml+xml',
  'text/plain',
];

@Injectable()
export class UrlProcessor {
  private readonly logger = new Logger(UrlProcessor.name);

  constructor(private readonly ssrfGuard: SsrfGuard) {}

  /**
   * Acquire and extract content from a URL with SSRF protection,
   * redirect safety, timeouts, and size limits.
   */
  async processUrl(
    initialUrl: string,
    options?: { timeoutMs?: number; maxBytes?: number },
  ): Promise<UrlProcessingResult> {
    const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    const maxBytes = options?.maxBytes ?? MAX_RESPONSE_BYTES;

    this.logger.debug(`Processing URL: ${initialUrl}`);

    let currentUrl = initialUrl.trim();
    let redirectCount = 0;
    let response: Response | null = null;

    while (redirectCount <= MAX_REDIRECTS) {
      // 1. SSRF check before every request
      const validation = await this.ssrfGuard.validateUrl(currentUrl);
      if (!validation.safe) {
        throw new UrlProcessingError(
          'URL_NOT_ALLOWED',
          `URL access denied: ${validation.reason ?? 'Blocked target'}`,
        );
      }

      // 2. Fetch with manual redirect handling & timeout
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      try {
        response = await fetch(currentUrl, {
          method: 'GET',
          redirect: 'manual',
          signal: controller.signal,
          headers: {
            'User-Agent': 'ApplyAlert-Bot/1.0 (+https://applyalert.app)',
            Accept: 'text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.8',
          },
        });
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') {
          throw new UrlProcessingError('FETCH_TIMEOUT', `Request timed out after ${timeoutMs}ms`);
        }
        const message = err instanceof Error ? err.message : 'Unknown fetch error';
        throw new UrlProcessingError('FETCH_FAILED', `Failed to fetch URL: ${message}`);
      } finally {
        clearTimeout(timer);
      }

      // 3. Handle redirects manually to validate each target against SSRF
      if ([301, 302, 303, 307, 308].includes(response.status)) {
        const location = response.headers.get('location');
        if (!location) {
          throw new UrlProcessingError('FETCH_FAILED', 'Redirect response missing location header');
        }

        try {
          currentUrl = new URL(location, currentUrl).toString();
        } catch {
          throw new UrlProcessingError('INVALID_URL', 'Invalid redirect target URL');
        }

        redirectCount++;
        if (redirectCount > MAX_REDIRECTS) {
          throw new UrlProcessingError('FETCH_FAILED', `Too many redirects (limit: ${MAX_REDIRECTS})`);
        }
        continue;
      }

      break;
    }

    if (!response || !response.ok) {
      const status = response ? response.status : 'No response';
      throw new UrlProcessingError(
        'FETCH_FAILED',
        `Remote server returned error status: ${status}`,
      );
    }

    // 4. Validate Content-Type
    const contentTypeHeader = response.headers.get('content-type') || '';
    const mimeType = contentTypeHeader.split(';')[0].trim().toLowerCase();

    const isAllowed = ALLOWED_CONTENT_TYPES.some((allowed) =>
      mimeType.includes(allowed),
    );

    if (!isAllowed) {
      throw new UrlProcessingError(
        'UNSUPPORTED_CONTENT_TYPE',
        `Unsupported content type: ${mimeType || 'unknown'}. Expected HTML or text.`,
      );
    }

    // 5. Enforce response body size limit while reading
    const contentLength = response.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > maxBytes) {
      throw new UrlProcessingError(
        'CONTENT_TOO_LARGE',
        `Content-Length exceeds maximum size of ${maxBytes} bytes`,
      );
    }

    const rawBody = await response.text();
    if (rawBody.length > maxBytes) {
      throw new UrlProcessingError(
        'CONTENT_TOO_LARGE',
        `Content body exceeds maximum size of ${maxBytes} bytes`,
      );
    }

    if (!rawBody.trim()) {
      throw new UrlProcessingError('EMPTY_CONTENT', 'Fetched page contains no content');
    }

    // 6. Extract structured text from HTML or Plain Text
    let extraction: HtmlExtractionResult;
    if (mimeType.includes('text/plain')) {
      extraction = {
        title: null,
        metaDescription: null,
        canonicalUrl: null,
        sections: [
          {
            heading: null,
            text: rawBody.trim(),
            sourceRef: currentUrl,
          },
        ],
        links: [],
        fullText: rawBody.trim(),
      };
    } else {
      extraction = extractHtml(rawBody, currentUrl);
    }

    if (!extraction.fullText || !extraction.fullText.trim()) {
      throw new UrlProcessingError(
        'EMPTY_CONTENT',
        'Could not extract any readable text from this page',
      );
    }

    const contentHash = crypto
      .createHash('sha256')
      .update(extraction.fullText, 'utf8')
      .digest('hex');

    return {
      finalUrl: currentUrl,
      normalizedText: extraction.fullText,
      contentHash,
      title: extraction.title,
      metaDescription: extraction.metaDescription,
      sections: extraction.sections,
      links: extraction.links,
    };
  }
}
