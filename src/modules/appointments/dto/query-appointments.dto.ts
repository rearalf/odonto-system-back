import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { PaginationDto } from '../../../common/dto/pagination.dto.js';

export class QueryAppointmentsDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Filter calendar by doctor identifier',
    example: 1,
    type: Number,
  })
  @IsOptional()
  @IsInt({ message: 'El ID del doctor debe ser un número entero.' })
  @Type(() => Number)
  doctorId?: number;

  @ApiPropertyOptional({
    description: 'Start date range boundary (YYYY-MM-DD or ISO 8601)',
    example: '2026-10-01',
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'La fecha de inicio debe ser una cadena de texto.' })
  from?: string;

  @ApiPropertyOptional({
    description: 'End date range boundary (YYYY-MM-DD or ISO 8601)',
    example: '2026-10-31',
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'La fecha de fin debe ser una cadena de texto.' })
  to?: string;

  @ApiPropertyOptional({
    description: 'Filter by patient name (searches first, middle, last name)',
    example: 'Juan Pérez',
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'El nombre del paciente debe ser una cadena de texto.' })
  patientName?: string;

  @ApiPropertyOptional({
    description:
      'Filter by appointment status IDs (references appointment_status table)',
    type: [Number],
    example: [1, 3],
  })
  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  @IsArray({ message: 'El filtro de estado debe ser un array.' })
  @IsInt({
    each: true,
    message: 'Cada ID de estado debe ser un número entero.',
  })
  @Min(1, { each: true, message: 'El ID del estado debe ser mayor a 0.' })
  @Type(() => Number)
  status?: number[];

  @ApiPropertyOptional({
    description: 'Field to sort by',
    enum: ['startTime', 'endTime', 'createdAt', 'updatedAt', 'modifiedAt'],
    example: 'startTime',
  })
  @IsOptional()
  @IsString({
    message: 'El campo de ordenamiento debe ser una cadena de texto.',
  })
  sortBy?: 'startTime' | 'endTime' | 'createdAt' | 'updatedAt' | 'modifiedAt';

  @ApiPropertyOptional({
    description: 'Sort direction',
    enum: ['ASC', 'DESC'],
    example: 'ASC',
  })
  @IsOptional()
  @IsString({
    message: 'La dirección de ordenamiento debe ser una cadena de texto.',
  })
  sortOrder?: 'ASC' | 'DESC';
}
