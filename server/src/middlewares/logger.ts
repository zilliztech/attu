import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  // eslint-disable-next-line @typescript-eslint/ban-types
  use(req: Request, res: Response, next: Function) {
    const { method = '', url = '' } = req.body || {};
    const { path = '' } = req.route || {};

    Logger.log(`${method} ${url}`, `API ${path}`);
    next();
  }
}
