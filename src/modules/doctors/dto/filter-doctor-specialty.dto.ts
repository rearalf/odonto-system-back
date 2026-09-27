import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto.js';

export class FilterDoctorSpecialtyDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Search keyword to filter the specialties by name.',
    example: 'endoc',
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
