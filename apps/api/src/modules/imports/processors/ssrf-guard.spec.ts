import { SsrfGuard } from './ssrf-guard';

describe('SsrfGuard', () => {
  let guard: SsrfGuard;

  beforeEach(() => {
    guard = new SsrfGuard();
  });

  describe('Protocol validation', () => {
    it('rejects unsupported protocols', async () => {
      const invalidUrls = [
        'ftp://example.com/file.txt',
        'file:///etc/passwd',
        'gopher://gopher.floodgap.com',
        'javascript:alert(1)',
        'data:text/plain;base64,SGVsbG8=',
      ];

      for (const url of invalidUrls) {
        const result = await guard.validateUrl(url);
        expect(result.safe).toBe(false);
      }
    });

    it('rejects malformed URLs', async () => {
      const result = await guard.validateUrl('not-a-url');
      expect(result.safe).toBe(false);
      expect(result.reason).toContain('Invalid URL');
    });
  });

  describe('IP & Hostname blocking', () => {
    it('blocks localhost and loopback IPv4', async () => {
      const loopbackUrls = [
        'http://localhost/admin',
        'http://localhost:3000',
        'http://127.0.0.1/metrics',
        'http://127.0.0.2:8080',
        'https://127.1.2.3',
      ];

      for (const url of loopbackUrls) {
        const result = await guard.validateUrl(url);
        expect(result.safe).toBe(false);
      }
    });

    it('blocks private 10.x.x.x addresses', async () => {
      const private10Urls = [
        'http://10.0.0.1',
        'http://10.254.0.1:8080',
        'https://10.1.2.3/secret',
      ];

      for (const url of private10Urls) {
        const result = await guard.validateUrl(url);
        expect(result.safe).toBe(false);
      }
    });

    it('blocks private 172.16.x.x - 172.31.x.x addresses', async () => {
      const private172Urls = [
        'http://172.16.0.1',
        'http://172.20.10.5',
        'http://172.31.255.255',
      ];

      for (const url of private172Urls) {
        const result = await guard.validateUrl(url);
        expect(result.safe).toBe(false);
      }
    });

    it('blocks private 192.168.x.x addresses', async () => {
      const private192Urls = [
        'http://192.168.1.1',
        'http://192.168.0.100:8000',
        'https://192.168.254.1',
      ];

      for (const url of private192Urls) {
        const result = await guard.validateUrl(url);
        expect(result.safe).toBe(false);
      }
    });

    it('blocks link-local and cloud metadata endpoints', async () => {
      const metadataUrls = [
        'http://169.254.169.254/latest/meta-data/',
        'http://169.254.170.2/v2/credentials',
        'http://169.254.1.1',
      ];

      for (const url of metadataUrls) {
        const result = await guard.validateUrl(url);
        expect(result.safe).toBe(false);
      }
    });
  });

  describe('Public domain names', () => {
    it('allows valid public domain names', async () => {
      const publicUrls = [
        'https://example.com/fellowship',
        'https://www.google.com',
        'http://example.org',
      ];

      for (const url of publicUrls) {
        const result = await guard.validateUrl(url);
        expect(result.safe).toBe(true);
      }
    });
  });
});
