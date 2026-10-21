import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsIn,
  Max,
  IsBoolean,
  Matches,
  IsPositive,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { PaginationDto } from '../../../common/dto/pagination.dto.js';

export class FilterDoctorAvailabilityDto extends PaginationDto {
  @ApiPropertyOptional({
    description:
      'Filtrar por bloques recurrentes (true) o de fecha específica (false)',
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isRecurring?: boolean;

  @ApiPropertyOptional({
    description:
      'Fecha inicio del rango (YYYY-MM-DD). Filtra bloques de fecha específica >= from',
    example: '2026-10-01',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'El campo from debe tener el formato YYYY-MM-DD.',
  })
  from?: string;

  @ApiPropertyOptional({
    description:
      'Fecha fin del rango (YYYY-MM-DD). Filtra bloques de fecha específica <= to',
    example: '2026-10-31',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'El campo to debe tener el formato YYYY-MM-DD.',
  })
  to?: string;

  @ApiPropertyOptional({
    description: 'Campo por el cual ordenar',
    enum: ['dayOfWeek', 'specificDate', 'startTime', 'endTime', 'createdAt'],
    default: 'dayOfWeek',
    example: 'dayOfWeek',
  })
  @IsOptional()
  @IsString()
  @IsIn(['dayOfWeek', 'specificDate', 'startTime', 'endTime', 'createdAt'])
  sort?: string = 'dayOfWeek';

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
