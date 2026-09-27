import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class UpdateDoctorDto {
  @ApiPropertyOptional({
    description:
      'Foreign key referencing the person that acts as this doctor. When it changes, the same validations applied on creation run again (person type must be Doctor and the person must not be a patient)',
    example: 10,
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt({ message: 'El campo persona debe ser un número entero.' })
  @Min(1, { message: 'El campo persona debe ser mayor que 0.' })
  personId?: number;

  @ApiPropertyOptional({
    description: 'Academic degree or professional title of the doctor',
    example: 'Doctor en Odontología, MSc en Implantología',
    maxLength: 255,
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsOptional()
  @IsString({
    message: 'El campo titulación debe ser una cadena de texto.',
  })
  @MaxLength(255, {
    message: 'El campo titulación no puede superar los 255 caracteres.',
  })
  qualification?: string;
}
