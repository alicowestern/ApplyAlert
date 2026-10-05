/**
 * Storage module — provides ObjectStorage to the application.
 */

import { Module, Global } from '@nestjs/common';
import { OBJECT_STORAGE } from './object-storage.interface';
import { LocalStorageAdapter } from './local-storage.adapter';

@Global()
@Module({
  providers: [
    {
      provide: OBJECT_STORAGE,
      useClass: LocalStorageAdapter,
    },
  ],
  exports: [OBJECT_STORAGE],
})
export class StorageModule {}
