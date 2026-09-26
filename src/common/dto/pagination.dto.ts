import { IsBoolean, IsOptional, IsPositive } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class PaginationDto {
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  @ApiProperty({
    required: false,
    default: true,
    description:
      'Determines whether pagination is applied. If set to false, all results will be returned without pagination.',
    example: true,
  })
  pagination?: boolean = true;

  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  @ApiProperty({
    required: false,
    default: 1,
    description:
      'The current page number when pagination is enabled. Must be a positive integer.',
    example: 1,
  })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  @ApiProperty({
    required: false,
    default: 10,
    description:
      'The number of items to return per page when pagination is enabled. Must be a positive integer.',
    example: 10,
  })
  per_page?: number = 10;
}
