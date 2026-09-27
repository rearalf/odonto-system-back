import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto.js';

export class FilterDoctorDto extends PaginationDto {
  @ApiPropertyOptional({
    description:
      'Search keyword to filter doctors by the first, middle or last name of their person record.',
    example: 'perez',
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
