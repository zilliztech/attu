import {
  Logger,
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { map, catchError, tap } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';

export interface Response<T> {
  statusCode: number;
  data: T;
}

/**
 *  transform response to client
 */
@Injectable()
export class TransformResInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next
      .handle()
      .pipe(map((data) => ({ statusCode: HttpStatus.OK, data })));
  }
}

/**
 * Handle error in here.
 * Normally depend on status which from milvus service.
 */
@Injectable()
export class ErrorInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((err) => {
        Logger.error('---error interceptor---', err);
        if (err.response) {
          return throwError(err);
        }
        return throwError(new BadRequestException(err.toString()));
      }),
    );
  }
}

/**
 * add spent time looger when accessing milvus.
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    return next
      .handle()
      .pipe(
        tap(() => Logger.log(`request to ${context.getArgs()[0]['url']} takes ${Date.now() - now}ms`)),
      );
  }
}
