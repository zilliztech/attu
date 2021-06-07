import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { map, catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';

export interface Response<T> {
  code: number;
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
    return next.handle().pipe(map((data) => ({ code: HttpStatus.OK, data })));
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
        console.error(err);

        if (err.isAxiosError && err.response) {
          const errContent = err.response.data || 'Bad Request';
          // from milvus http service
          const status = err.response.status || 400;

          // operationId is milvus operation id, client need it in response
          err.operationId &&
            errContent instanceof Object &&
            (errContent.operationId = err.operationId);
          switch (status) {
            case 400:
              return throwError(new BadRequestException(errContent));
            case 404:
              return throwError(new NotFoundException('Not Found Api'));
            default:
              return throwError(new BadRequestException(errContent));
          }
        }

        return throwError(err);
      }),
    );
  }
}
