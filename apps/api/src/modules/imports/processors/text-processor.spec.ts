import { processText, TextProcessingError, MAX_TEXT_LENGTH } from './text-processor';

describe('TextProcessor', () => {
  it('throws EMPTY_CONTENT on empty string or whitespace only', () => {
    expect(() => processText('')).toThrow(TextProcessingError);
    expect(() => processText('   \n  \t  ')).toThrow(TextProcessingError);
  });

  it('throws CONTENT_TOO_LARGE when exceeding MAX_TEXT_LENGTH', () => {
    const huge = 'A'.repeat(MAX_TEXT_LENGTH + 1);
    expect(() => processText(huge)).toThrow(TextProcessingError);
  });

  it('normalizes CRLF and CR line endings to LF', () => {
    const input = 'Line 1\r\nLine 2\rLine 3\nLine 4';
    const result = processText(input);

    expect(result.normalizedText).toBe('Line 1\nLine 2\nLine 3\nLine 4');
    expect(result.originalText).toBe(input);
  });

  it('collapses 3+ consecutive line breaks into 2', () => {
    const input = 'Paragraph 1\n\n\n\n\nParagraph 2';
    const result = processText(input);

    expect(result.normalizedText).toBe('Paragraph 1\n\nParagraph 2');
  });

  it('generates deterministic SHA-256 hash for identical normalized content', () => {
    const textA = 'Apply by October 30, 2026.\r\nFull funding provided.';
    const textB = 'Apply by October 30, 2026.\nFull funding provided.   ';

    const resultA = processText(textA);
    const resultB = processText(textB);

    expect(resultA.contentHash).toBe(resultB.contentHash);
    expect(resultA.contentHash).toHaveLength(64); // SHA-256 hex string
  });
});
