import { ok, err, unwrap } from '../src/types/result';

describe('Result type', () => {
  describe('ok', () => {
    it('creates a success result', () => {
      const result = ok(42);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe(42);
      }
    });

    it('works with complex values', () => {
      const result = ok({ name: 'test', count: 3 });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.name).toBe('test');
      }
    });
  });

  describe('err', () => {
    it('creates a failure result', () => {
      const result = err(new Error('failed'));
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.message).toBe('failed');
      }
    });

    it('works with custom error types', () => {
      const result = err({ kind: 'NETWORK' as const, message: 'timeout' });
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.kind).toBe('NETWORK');
      }
    });
  });

  describe('unwrap', () => {
    it('returns value for success result', () => {
      const result = ok('hello');
      expect(unwrap(result)).toBe('hello');
    });

    it('throws for failure result', () => {
      const error = new Error('unwrap failed');
      const result = err(error);
      expect(() => unwrap(result)).toThrow('unwrap failed');
    });
  });
});
