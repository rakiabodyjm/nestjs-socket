import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  applyDecorators,
  UseInterceptors,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class CustomSerializeInterceptor implements NestInterceptor {
  constructor(private entity: any) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> {
    // Run something before a request is handled by the request handler
    return next.handle().pipe(
      map((data: any) => {
        // Run something before the response is sent out
        return plainToInstance(this.entity, data);
      }),
    );
  }
}

export function UseCustomSerialize(entity: any) {
  return applyDecorators(
    UseInterceptors(new CustomSerializeInterceptor(entity)),
  );
}
