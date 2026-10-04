import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

export const DEV_USER_ID_HEADER = 'x-dev-user-id';
export const DEFAULT_DEV_USER_ID = 'dev-user-id';

export interface AuthenticatedUser {
  id: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

@Injectable()
export class DevUserMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction) {
    const userIdHeader = req.headers[DEV_USER_ID_HEADER];
    const userId = (typeof userIdHeader === 'string' && userIdHeader.trim())
      ? userIdHeader.trim()
      : (process.env.DEV_USER_ID || DEFAULT_DEV_USER_ID);

    req.user = { id: userId };
    next();
  }
}
