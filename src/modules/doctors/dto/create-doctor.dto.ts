import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

import { CreateDoctorSpecialtyDto } from './create-doctor-specialty.dto.js';

export class CreateDoctorDto {
  @ApiProperty({
    description:
      'Foreign key referencing the person that will act as doctor. The person must exist, must have person_type_id 4 (Doctor) and must not be registered as a patient',
    example: 10,
  })
  @Type(() => Number)
  @IsInt({ message: 'El campo persona debe ser un número entero.' })
  @Min(1, { message: 'El campo persona debe ser mayor que 0.' })
  personId: number;

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

  @ApiPropertyOptional({
    description:
      'Specialties to attach in the same transaction. Optional, the doctor can be registered without specialties and they can be added later',
    type: [CreateDoctorSpecialtyDto],
    example: [{ specialtyId: 3, isPrimary: true }],
  })
  @IsOptional()
  @IsArray({ message: 'El campo especialidades debe ser una lista.' })
  @ArrayMaxSize(20, {
    message: 'No se pueden registrar más de 20 especialidades por doctor.',
  })
  @ValidateNested({ each: true })
  @Type(() => CreateDoctorSpecialtyDto)
  @IsNotEmpty()
  specialties?: CreateDoctorSpecialtyDto[];
}
