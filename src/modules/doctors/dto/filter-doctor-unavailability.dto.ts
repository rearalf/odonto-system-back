import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsIn, Max, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../../common/dto/pagination.dto.js';

export class FilterDoctorUnavailabilityDto extends PaginationDto {
  @ApiPropertyOptional({
    description:
      'Fecha inicio del rango (YYYY-MM-DD). Incluye bloques que terminen en o después de esta fecha.',
    example: '2026-10-01',
  })
  @IsOptional()
  @IsString()
  from?: string;

  @ApiPropertyOptional({
    description:
      'Fecha fin del rango (YYYY-MM-DD). Incluye bloques que inicien en o antes de esta fecha.',
    example: '2026-10-31',
  })
  @IsOptional()
  @IsString()
  to?: string;

  @ApiPropertyOptional({
    description: 'Campo por el cual ordenar',
    enum: ['startTime', 'endTime', 'createdAt'],
    default: 'startTime',
    example: 'startTime',
  })
  @IsOptional()
  @IsString()
  @IsIn(['startTime', 'endTime', 'createdAt'])
  sort?: string = 'startTime';

  @ApiPropertyOptional({
    description: 'Dirección del ordenamiento',
    enum: ['ASC', 'DESC'],
    default: 'ASC',
    example: 'ASC',
  })
  @IsOptional()
  @IsString()
  @IsIn(['ASC', 'DESC'])
  order?: 'ASC' | 'DESC' = 'ASC';

  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  @Max(50)
  @ApiPropertyOptional({
    required: false,
    default: 10,
    maximum: 50,
    description: 'Número de items por página (máximo 50)',
    example: 10,
  })
  per_page?: number = 10;
}
