import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Response } from 'express';
import { Observable, tap } from 'rxjs';
import { PaginationMeta } from '../helpers/pagination-helper.js';

export interface PaginatedResponse<T> {
  data: T;
  meta: PaginationMeta | null;
}

@Injectable()
export class PaginationHeadersInterceptor<T> implements NestInterceptor<
  T,
  PaginatedResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<PaginatedResponse<T>> {
    const res = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      tap((response) => {
        if (response?.meta) {
          res.set({
            total_count: response.meta.total_count,
            total_pages: response.meta.total_pages,
            page: response.meta.page,
            per_page: response.meta.per_page,
          });
        }
      }),
    );
  }
}
