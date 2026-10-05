/**
 * Provider-independent object storage interface.
 *
 * Abstracts file storage so the application code is decoupled from
 * any specific provider. Implementations may use:
 * - Local filesystem (development)
 * - AWS S3
 * - Cloudflare R2
 * - Supabase Storage
 * - MinIO
 */

export interface ObjectMetadata {
  key: string;
  size: number;
  contentType: string;
  createdAt: Date;
}

export interface PutObjectInput {
  /** Server-generated storage key (never user-controlled). */
  key: string;
  /** File content as Buffer. */
  body: Buffer;
  /** MIME content type. */
  contentType: string;
}

export interface ObjectStorage {
  /**
   * Store an object. Overwrites if key already exists (idempotent).
   */
  putObject(input: PutObjectInput): Promise<void>;

  /**
   * Retrieve an object by key.
   * Returns null if the object does not exist.
   */
  getObject(key: string): Promise<Buffer | null>;

  /**
   * Delete an object by key. No-op if object does not exist (idempotent).
   */
  deleteObject(key: string): Promise<void>;

  /**
   * Get metadata for an object.
   * Returns null if the object does not exist.
   */
  getMetadata(key: string): Promise<ObjectMetadata | null>;
}

/**
 * Injection token for ObjectStorage.
 */
export const OBJECT_STORAGE = Symbol('OBJECT_STORAGE');
