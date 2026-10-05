import { Module } from '@nestjs/common';
import { ExtractionsController } from './extractions.controller';
import { ExtractionsService } from './extractions.service';
import { OpenAiExtractionProvider } from './providers/openai-extraction.provider';
import { EXTRACTION_PROVIDER } from './providers/extraction-provider.interface';

@Module({
  controllers: [ExtractionsController],
  providers: [
    ExtractionsService,
    {
      provide: EXTRACTION_PROVIDER,
      useClass: OpenAiExtractionProvider,
    },
  ],
  exports: [ExtractionsService],
})
export class ExtractionsModule {}
