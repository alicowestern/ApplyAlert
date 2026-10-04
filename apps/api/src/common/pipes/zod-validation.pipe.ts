import { PipeTransform, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { ZodSchema, ZodError } from 'zod';

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown, _metadata: ArgumentMetadata) {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      const error = result.error as ZodError;
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'Input validation failed',
        details: error.flatten().fieldErrors,
      });
    }
    return result.data;
  }
}
