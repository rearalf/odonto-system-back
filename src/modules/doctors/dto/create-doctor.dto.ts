import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { plainToInstance, Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

import { CreateDoctorSpecialtyDto } from './create-doctor-specialty.dto.js';

export class CreateDoctorDto {
  @ApiPropertyOptional({
    description:
      'Profile picture file (handled via multipart/form-data file upload).',
  })
  @IsOptional()
  profilePicture?: string;

  @ApiProperty({
    description: "Primary first name of the doctor's person record.",
    example: 'Juan',
  })
  @IsString({ message: 'El primer nombre debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El primer nombre es obligatorio.' })
  @MaxLength(255, {
    message: 'El primer nombre no puede exceder los 255 caracteres.',
  })
  firstName: string;

  @ApiPropertyOptional({
    description: "Middle or second name of the doctor's person record.",
    example: 'Carlos',
  })
  @IsOptional()
  @IsString({ message: 'El segundo nombre debe ser una cadena de texto.' })
  @MaxLength(255, {
    message: 'El segundo nombre no puede exceder los 255 caracteres.',
  })
  middleName?: string;

  @ApiProperty({
    description: "Primary last name/surname of the doctor's person record.",
    example: 'Pérez',
  })
  @IsString({ message: 'El apellido debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El apellido es obligatorio.' })
  @MaxLength(255, {
    message: 'El apellido no puede exceder los 255 caracteres.',
  })
  lastName: string;

  @ApiPropertyOptional({
    description:
      'Identifier of the application user account associated with this person, if exists.',
    example: 1,
  })
  @IsOptional()
  @IsInt({ message: 'El ID de usuario debe ser un número entero.' })
  @Type(() => Number)
  userId?: number;

  @ApiPropertyOptional({
    description: 'Contact phone number of the doctor.',
    example: '71234567',
  })
  @IsOptional()
  @IsString({ message: 'El teléfono debe ser una cadena de texto.' })
  @ValidateIf((_, value) => value !== '' && value != null)
  @MaxLength(8, { message: 'El teléfono no puede exceder los 8 caracteres.' })
  @Matches(/^\d{8}$/, {
    message: 'El teléfono debe contener exactamente 8 dígitos.',
  })
  phone?: string;

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
      'Specialties to attach in the same transaction. Optional, the doctor can be registered without specialties and they can be added later. multipart/form-data cannot carry a nested array, so send it as a JSON string (JSON.stringify). An empty list "[]" is treated as no specialties',
    example: '[{"specialtyId":3,"isPrimary":true}]',
  })
  @Transform(({ value }) => {
    if (typeof value !== 'string') return value;
    try {
      const parsed: unknown = JSON.parse(value);
      if (!Array.isArray(parsed)) return value;
      if (parsed.length === 0) return undefined;
      return plainToInstance(CreateDoctorSpecialtyDto, parsed);
    } catch {
      return value;
    }
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
