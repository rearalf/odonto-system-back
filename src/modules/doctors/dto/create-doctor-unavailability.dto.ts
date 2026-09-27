import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateDoctorUnavailabilityDto {
  @ApiProperty({
    description: 'Start instant of the unavailability block (ISO 8601)',
    example: '2026-10-15T14:00:00.000Z',
  })
  @IsString({
    message: 'El campo inicio debe ser una cadena de texto.',
  })
  @IsDateString({}, { message: 'El campo inicio debe ser una fecha válida.' })
  startTime: string;

  @ApiProperty({
    description:
      'End instant of the unavailability block (ISO 8601). Must be greater than the start time',
    example: '2026-10-15T18:00:00.000Z',
  })
  @IsString({ message: 'El campo fin debe ser una cadena de texto.' })
  @IsDateString({}, { message: 'El campo fin debe ser una fecha válida.' })
  endTime: string;

  @ApiPropertyOptional({
    description: 'Reason why the doctor is unavailable',
    example: 'Vacaciones',
    maxLength: 255,
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsOptional()
  @IsString({
    message: 'El campo motivo debe ser una cadena de texto.',
  })
  @MaxLength(255, {
    message: 'El campo motivo no puede superar los 255 caracteres.',
  })
  reason?: string;
}
