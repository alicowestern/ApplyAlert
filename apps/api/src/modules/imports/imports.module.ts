import { Module } from '@nestjs/common';
import { ImportsController } from './imports.controller';
import { ImportsService } from './imports.service';
import { UrlProcessor } from './processors/url-processor';
import { FileProcessor } from './processors/file-processor';
import { SsrfGuard } from './processors/ssrf-guard';

@Module({
  controllers: [ImportsController],
  providers: [
    ImportsService,
    UrlProcessor,
    FileProcessor,
    SsrfGuard,
  ],
  exports: [ImportsService],
})
export class ImportsModule {}
