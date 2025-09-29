import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  InternalServerErrorException,
  HttpException,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((err) =>
        throwError(() => {
          if (err instanceof HttpException) {
            return err;
          }
          if (err?.code) {
            return new HttpException(
              err?.message || 'Internal Server Error',
              err.code || 500,
            );
          }

          return new InternalServerErrorException(
            err?.message || 'Internal Server Error',
          );
        }),
      ),
    );
  }
}
