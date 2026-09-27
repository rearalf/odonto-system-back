import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateSpecialtyDto {
  @ApiPropertyOptional({
    description: 'Unique name of the dental specialty',
    example: 'Endodoncia',
    maxLength: 255,
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsOptional()
  @IsString({ message: 'El campo nombre debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El campo nombre no puede estar vacío.' })
  @MaxLength(255, {
    message: 'El campo nombre no puede superar los 255 caracteres.',
  })
  name?: string;

  @ApiPropertyOptional({
    description: 'Detailed description of what the specialty covers',
    example: 'Tratamientos del conducto radicular.',
    maxLength: 255,
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsOptional()
  @IsString({
    message: 'El campo descripción debe ser una cadena de texto.',
  })
  @MaxLength(255, {
    message: 'El campo descripción no puede superar los 255 caracteres.',
  })
  description?: string;
}
