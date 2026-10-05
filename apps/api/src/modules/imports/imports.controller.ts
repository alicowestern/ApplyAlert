import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UsePipes,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { ImportsService } from './imports.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/middleware/dev-user.middleware';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import {
  CreateTextImportSchema,
  CreateUrlImportSchema,
} from '@applyalert/validation';
import type {
  ApiResponse,
  ImportResponseDto,
  CreateTextImportDto,
  CreateUrlImportDto,
  ListImportsQuery,
} from '@applyalert/contracts';

interface UploadedMulterFile {
  fieldname?: string;
  originalname: string;
  encoding?: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

@ApiTags('imports')
@Controller({
  path: 'imports',
  version: '1',
})
export class ImportsController {
  constructor(private readonly importsService: ImportsService) {}

  @Post('text')
  @ApiOperation({ summary: 'Create and process a text import' })
  @UsePipes(new ZodValidationPipe(CreateTextImportSchema))
  async createText(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateTextImportDto,
  ): Promise<ApiResponse<ImportResponseDto>> {
    const data = await this.importsService.createTextImport(user.id, dto);
    return { success: true, data, error: null };
  }

  @Post('url')
  @ApiOperation({ summary: 'Create and process a URL import' })
  @UsePipes(new ZodValidationPipe(CreateUrlImportSchema))
  async createUrl(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateUrlImportDto,
  ): Promise<ApiResponse<ImportResponseDto>> {
    const data = await this.importsService.createUrlImport(user.id, dto);
    return { success: true, data, error: null };
  }

  @Post('file')
  @ApiOperation({ summary: 'Upload and process a file import (PDF or Image)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  )
  async createFile(
    @CurrentUser() user: AuthenticatedUser,
    @UploadedFile() file?: UploadedMulterFile,
  ): Promise<ApiResponse<ImportResponseDto>> {
    if (!file) {
      throw new BadRequestException('No file uploaded. Please provide a "file" field.');
    }

    const data = await this.importsService.createFileImport(user.id, {
      buffer: file.buffer,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    });
    return { success: true, data, error: null };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get import status and details' })
  async getOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<ApiResponse<ImportResponseDto>> {
    const data = await this.importsService.getImport(user.id, id);
    return { success: true, data, error: null };
  }

  @Get()
  @ApiOperation({ summary: 'List imports for current user' })
  async list(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListImportsQuery,
  ): Promise<ApiResponse<{ items: ImportResponseDto[]; nextCursor: string | null }>> {
    const data = await this.importsService.listImports(user.id, query);
    return { success: true, data, error: null };
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel an in-flight import' })
  async cancel(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<ApiResponse<ImportResponseDto>> {
    const data = await this.importsService.cancelImport(user.id, id);
    return { success: true, data, error: null };
  }
}
