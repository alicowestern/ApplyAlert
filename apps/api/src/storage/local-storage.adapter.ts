/**
 * Local filesystem implementation of ObjectStorage.
 *
 * Suitable for development. Files are stored under a configurable
 * base directory with server-generated keys that prevent path traversal.
 *
 * In production, replace with S3-compatible adapter.
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { ObjectStorage, PutObjectInput, ObjectMetadata } from './object-storage.interface';

@Injectable()
export class LocalStorageAdapter implements ObjectStorage {
  private readonly logger = new Logger(LocalStorageAdapter.name);
  private readonly baseDir: string;

  constructor(private readonly config: ConfigService) {
    this.baseDir = this.config.get<string>('UPLOAD_DIR') || path.join(process.cwd(), '..', '..', 'uploads');
    this.logger.log(`LocalStorageAdapter initialized with baseDir: ${this.baseDir}`);
  }

  async putObject(input: PutObjectInput): Promise<void> {
    const filePath = this.resolveAndValidate(input.key);
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(filePath, input.body);
    this.logger.debug(`Stored object: ${input.key} (${input.body.length} bytes)`);
  }

  async getObject(key: string): Promise<Buffer | null> {
    const filePath = this.resolveAndValidate(key);
    try {
      return await fs.readFile(filePath);
    } catch (err: unknown) {
      if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
        return null;
      }
      throw err;
    }
  }

  async deleteObject(key: string): Promise<void> {
    const filePath = this.resolveAndValidate(key);
    try {
      await fs.unlink(filePath);
      this.logger.debug(`Deleted object: ${key}`);
    } catch (err: unknown) {
      if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
        // Already gone — idempotent
        return;
      }
      throw err;
    }
  }

  async getMetadata(key: string): Promise<ObjectMetadata | null> {
    const filePath = this.resolveAndValidate(key);
    try {
      const stat = await fs.stat(filePath);
      return {
        key,
        size: stat.size,
        contentType: 'application/octet-stream', // Local FS doesn't track content type
        createdAt: stat.birthtime,
      };
    } catch (err: unknown) {
      if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
        return null;
      }
      throw err;
    }
  }

  /**
   * Resolve key to a filesystem path, with path traversal protection.
   *
   * Keys are server-generated (e.g., "userId/importId/uuid.ext") but we
   * still validate to ensure no component escapes the base directory.
   */
  private resolveAndValidate(key: string): string {
    // Reject obviously dangerous patterns
    if (key.includes('..') || key.includes('\0') || path.isAbsolute(key)) {
      throw new Error(`Invalid storage key: ${key}`);
    }

    const resolved = path.resolve(this.baseDir, key);

    // Ensure the resolved path is still within baseDir
    const normalizedBase = path.resolve(this.baseDir);
    if (!resolved.startsWith(normalizedBase + path.sep) && resolved !== normalizedBase) {
      throw new Error(`Storage key escapes base directory: ${key}`);
    }

    return resolved;
  }
}
