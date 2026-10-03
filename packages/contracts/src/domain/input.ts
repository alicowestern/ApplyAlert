/**
 * Input source types for ApplyAlert.
 *
 * Represents the various ways users can provide opportunities
 * to the application for processing.
 */

/**
 * The type of content being imported.
 */
export type InputContentType =
  | 'URL' // Pasted or shared URL
  | 'TEXT' // Pasted or shared plain text
  | 'IMAGE' // Screenshot or selected image
  | 'PDF'; // Selected or shared PDF document

/**
 * Represents raw input from the user before AI processing.
 */
export interface RawInput {
  /** How the content was provided. */
  readonly contentType: InputContentType;

  /** How the input was received by the app. */
  readonly entryMethod: 'PASTE' | 'SHARE' | 'FILE_PICK' | 'CAMERA';

  /** The raw content â€” URL string, plain text, or base64 for binary. */
  readonly content: string;

  /** MIME type when applicable (e.g., "image/png", "application/pdf"). */
  readonly mimeType: string | null;

  /** Original filename if from file pick or share. */
  readonly fileName: string | null;

  /** ISO 8601 timestamp of when the input was received. */
  readonly receivedAt: string;
}
