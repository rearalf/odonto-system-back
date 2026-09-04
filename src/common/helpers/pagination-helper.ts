import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';
import { PaginationDto } from '../dto/pagination.dto.js';

export interface PaginationMeta {
  total_count: number;
  total_pages: number;
  page: number;
  per_page: number;
}

export class PaginationHelper {
  static paginate<T extends ObjectLiteral>(
    queryBuilder: SelectQueryBuilder<T>,
    page: number = 1,
    limit: number = 10,
  ): { limit: number; page: number } {
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);
    return {
      limit,
      page,
    };
  }

  static buildMeta(
    total: number,
    paginationDto: PaginationDto,
  ): PaginationMeta | null {
    const { pagination, page = 1, per_page: perPage = 10 } = paginationDto;

    if (!pagination) return null;

    return {
      total_count: total,
      total_pages: Math.ceil(total / perPage),
      page,
      per_page: perPage,
    };
  }
}
