import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiError, ApiResponse } from '@applyalert/contracts';
import { REQUEST_ID_HEADER } from '../middleware/request-id.middleware';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const requestId = (request.headers[REQUEST_ID_HEADER] as string) || undefined;

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_SERVER_ERROR';
    let message = 'An unexpected error occurred';
    let details: Record<string, unknown> | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        const obj = res as Record<string, unknown>;
        message = (obj.message as string) || exception.message;
        code = (obj.code as string) || exception.name;
        if (obj.details && typeof obj.details === 'object') {
          details = obj.details as Record<string, unknown>;
        }
      }
    } else if (exception instanceof Error) {
      this.logger.error(`Unhandled Exception: ${exception.message}`, exception.stack);
      message = exception.message;
    } else {
      this.logger.error(`Unknown exception thrown: ${JSON.stringify(exception)}`);
    }

    const apiError: ApiError = {
      code,
      message: Array.isArray(message) ? message.join('; ') : message,
      requestId,
      details,
    };

    const apiResponse: ApiResponse<null> = {
      success: false,
      data: null,
      error: apiError,
    };

    response.status(status).json(apiResponse);
  }
}
