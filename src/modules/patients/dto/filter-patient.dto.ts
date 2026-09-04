import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto.js';

export class FilterPatientDto extends PaginationDto {
  @ApiPropertyOptional({
    description:
      'Search keyword to filter patients by first name, middle name, or last name.',
    example: 'Juan',
  })
  @IsOptional()
  @IsString({
    message: 'El campo busqueda debe ser una cadena de texto.',
  })
  @MaxLength(100, {
    message: 'El campo busqueda no puede superar los 100 caracteres.',
  })
  search?: string;
}
