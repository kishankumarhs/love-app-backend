import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseResponse } from '../types';

export interface Response<T> extends BaseResponse {
  data: T;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const response = context.switchToHttp().getResponse();
    return next.handle().pipe(
      map((data) => {
        // Check if data is already in BaseResponse format
        if (
          data &&
          typeof data === 'object' &&
          'status' in data &&
          'message' in data
        ) {
          return data;
        }
        return {
          status: response.statusCode,
          message: 'Success',
          data,
        };
      }),
    );
  }
}
