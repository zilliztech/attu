import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { map, catchError } from 'rxjs/operators';
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
        console.error('---error interceptor---', err.response);
        if (err.response) {
          return throwError(err);
        }
        return throwError(new BadRequestException(err.toString()));
      }),
    );
  }
}
