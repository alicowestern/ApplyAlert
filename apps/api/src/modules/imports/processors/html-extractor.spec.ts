import { extractHtml } from './html-extractor';

describe('HtmlExtractor', () => {
  const sampleHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <title>Global AI Fellowship 2026</title>
      <meta name="description" content="A fully-funded 12-month AI fellowship in Zurich." />
      <link rel="canonical" href="https://example.org/fellowship" />
      <style>body { font-family: sans-serif; }</style>
      <script>console.log("tracking code");</script>
    </head>
    <body>
      <header class="site-header">
        <nav role="navigation">
          <a href="/home">Home</a>
          <a href="/about">About</a>
        </nav>
      </header>

      <div class="cookie-banner">We use cookies. <button>Accept</button></div>

      <main id="main-content">
        <h1>Global AI Fellowship 2026</h1>
        <p>We are offering 10 fellowships for aspiring machine learning researchers.</p>

        <h2>Eligibility & Requirements</h2>
        <ul>
          <li>Open to international applicants</li>
          <li>Must have programming experience in Python</li>
        </ul>

        <h2>Deadlines & Application</h2>
        <p>Applications close on November 15, 2026. Please apply through our portal.</p>
        <a href="https://portal.example.org/apply">Apply Now</a>
        <a href="https://portal.example.org/apply">Apply Now</a>
      </main>

      <footer class="site-footer">
        <p>&copy; 2026 Research Foundation</p>
      </footer>
    </body>
    </html>
  `;

  it('extracts metadata (title, meta description, canonical URL)', () => {
    const result = extractHtml(sampleHtml, 'https://example.org/fellowship');

    expect(result.title).toBe('Global AI Fellowship 2026');
    expect(result.metaDescription).toBe('A fully-funded 12-month AI fellowship in Zurich.');
    expect(result.canonicalUrl).toBe('https://example.org/fellowship');
  });

  it('strips scripts, styles, nav headers, footers, and cookie banners', () => {
    const result = extractHtml(sampleHtml, 'https://example.org/fellowship');

    expect(result.fullText).not.toContain('console.log');
    expect(result.fullText).not.toContain('font-family');
    expect(result.fullText).not.toContain('We use cookies');
    expect(result.fullText).not.toContain('Home');
    expect(result.fullText).not.toContain('&copy; 2026');
  });

  it('preserves headings and content in full text', () => {
    const result = extractHtml(sampleHtml, 'https://example.org/fellowship');

    expect(result.fullText).toContain('Global AI Fellowship 2026');
    expect(result.fullText).toContain('Eligibility & Requirements');
    expect(result.fullText).toContain('November 15, 2026');
    expect(result.fullText).toContain('Open to international applicants');
  });

  it('extracts and deduplicates hyperlinks', () => {
    const result = extractHtml(sampleHtml, 'https://example.org/fellowship');

    expect(result.links.length).toBe(1);
    expect(result.links[0].href).toBe('https://portal.example.org/apply');
    expect(result.links[0].text).toBe('Apply Now');
  });
});
