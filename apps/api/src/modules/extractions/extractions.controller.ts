import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ExtractionsService } from './extractions.service';
import { ExtractionInput } from '@applyalert/contracts';
import { ConfirmExtractionDtoSchema } from '@applyalert/validation';

@ApiTags('extractions')
@Controller('api/v1')
export class ExtractionsController {
  constructor(private readonly extractionsService: ExtractionsService) {}

  @Post('imports/:importId/extract')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Trigger AI extraction for an import' })
  async triggerExtraction(
    @Param('importId') importId: string,
    @Headers('x-dev-user-id') userId: string,
    @Body() input: ExtractionInput,
  ) {
    const extraction = await this.extractionsService.triggerExtraction(importId, userId, input);
    return {
      success: true,
      data: {
        id: extraction.id,
        status: extraction.status,
      }
    };
  }

  @Get('extractions/:id')
  @ApiOperation({ summary: 'Get extraction status and results' })
  async getExtraction(
    @Param('id') id: string,
  ) {
    const ext = await this.extractionsService.getExtraction(id);
    return {
      success: true,
      data: ext,
    };
  }

  @Post('extractions/:id/confirm')
  @ApiOperation({ summary: 'Confirm extraction and create Opportunity' })
  async confirmExtraction(
    @Param('id') id: string,
    @Headers('x-dev-user-id') userId: string,
    @Body() dto: any, // In reality, we'd use a ZodValidationPipe
  ) {
    const parsedDto = ConfirmExtractionDtoSchema.parse(dto) as any;
    const opportunity = await this.extractionsService.confirmExtraction(id, userId, parsedDto);
    
    return {
      success: true,
      data: {
        opportunity,
      },
    };
  }
}
