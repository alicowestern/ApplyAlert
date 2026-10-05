import type { ImportErrorCode } from '@applyalert/contracts';

export const USER_SAFE_ERROR_MESSAGES: Record<ImportErrorCode, string> = {
  INVALID_URL: 'The provided URL is invalid or malformed.',
  URL_NOT_ALLOWED: 'The provided URL cannot be accessed for security reasons.',
  FETCH_TIMEOUT: 'Fetching the URL timed out. Please try again.',
  FETCH_FAILED: 'Could not fetch content from the provided URL.',
  CONTENT_TOO_LARGE: 'The content exceeds the maximum allowed size limit.',
  UNSUPPORTED_CONTENT_TYPE: 'The content type returned from the URL is not supported.',
  UNSUPPORTED_FILE_TYPE: 'This file type is not supported. Please upload an image (JPEG, PNG, WebP) or PDF.',
  FILE_TOO_LARGE: 'The uploaded file exceeds the 10MB size limit.',
  INVALID_PDF: 'The provided PDF file is corrupted or could not be parsed.',
  PDF_TEXT_EXTRACTION_FAILED: 'Could not extract text from this PDF. It may be scanned or image-only.',
  EMPTY_CONTENT: 'The provided input contained no readable text or content.',
  STORAGE_FAILED: 'Failed to safely store the uploaded file.',
  PROCESSING_FAILED: 'An error occurred while processing the input. Please try again.',
};

export function getUserSafeErrorMessage(code: ImportErrorCode): string {
  return USER_SAFE_ERROR_MESSAGES[code] || USER_SAFE_ERROR_MESSAGES.PROCESSING_FAILED;
}
