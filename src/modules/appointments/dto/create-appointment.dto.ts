import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateAppointmentDto {
  @ApiPropertyOptional({
    description: 'Primary clinical reason for booking the consultation',
    example: 'Routine checkup and blood pressure monitoring',
    maxLength: 255,
  })
  @IsOptional()
  @IsString({ message: 'El motivo debe ser una cadena de texto.' })
  @MaxLength(255, { message: 'El motivo no puede exceder los 255 caracteres.' })
  reason?: string;

  @ApiPropertyOptional({
    description: 'Additional clinical or administrative remarks',
    example: 'First-time patient; requested Spanish-speaking doctor',
    maxLength: 255,
  })
  @IsOptional()
  @IsString({ message: 'Las notas deben ser una cadena de texto.' })
  @MaxLength(255, {
    message: 'Las notas no pueden exceder los 255 caracteres.',
  })
  notes?: string;

  @ApiPropertyOptional({
    description:
      'Initial appointment status ID (references appointment_status table)',
    example: 1,
    type: Number,
    default: 1,
  })
  @IsOptional()
  @IsInt({ message: 'El ID del estado debe ser un número entero.' })
  @Min(1, { message: 'El ID del estado debe ser mayor a 0.' })
  @Type(() => Number)
  statusId?: number;

  @ApiProperty({
    description: 'Start date and time in UTC (ISO 8601 string)',
    example: '2026-10-28T09:00:00.000Z',
    type: String,
    format: 'date-time',
  })
  @IsNotEmpty({ message: 'La fecha de inicio es obligatoria.' })
  @IsString({
    message:
      'La fecha de inicio debe ser una cadena de texto en formato ISO 8601.',
  })
  start_time: string;

  @ApiProperty({
    description: 'End date and time in UTC (ISO 8601 string)',
    example: '2026-10-28T09:30:00.000Z',
    type: String,
    format: 'date-time',
  })
  @IsNotEmpty({ message: 'La fecha de fin es obligatoria.' })
  @IsString({
    message:
      'La fecha de fin debe ser una cadena de texto en formato ISO 8601.',
  })
  end_time: string;

  @ApiProperty({
    description: 'Identifier of the doctor assigned to the appointment',
    example: 1,
    type: Number,
  })
  @IsInt({ message: 'El ID del doctor debe ser un número entero.' })
  @Type(() => Number)
  @IsNotEmpty({ message: 'El ID del doctor es obligatorio.' })
  doctor_id: number;

  @ApiProperty({
    description: 'Identifier of the patient receiving the consultation',
    example: 45,
    type: Number,
  })
  @IsInt({ message: 'El ID del paciente debe ser un número entero.' })
  @Type(() => Number)
  @IsNotEmpty({ message: 'El ID del paciente es obligatorio.' })
  patient_id: number;

  @ApiPropertyOptional({
    description: 'Indicates if the patient attended as an unscheduled walk-in',
    default: false,
    example: false,
    type: Boolean,
  })
  @IsOptional()
  @IsBoolean({ message: 'El campo walk-in debe ser un valor booleano.' })
  is_walk_in?: boolean;

  @ApiPropertyOptional({
    description:
      'Permite agendar en sobrecupo ignorando solapamiento de horario (uso exclusivo Walk-in)',
    default: false,
    example: false,
    type: Boolean,
  })
  @IsOptional()
  @IsBoolean({
    message: 'El campo allow_overbooking debe ser un valor booleano.',
  })
  allow_overbooking?: boolean;
}
