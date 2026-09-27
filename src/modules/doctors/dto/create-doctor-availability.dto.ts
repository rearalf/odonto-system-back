import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
} from 'class-validator';

import { TransformBoolean } from '../../../common/dto/transform-boolean.js';
import { DayOfWeek } from '../../../common/enums/day-of-week.enum.js';

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;

export class CreateDoctorAvailabilityDto {
  @ApiProperty({
    description:
      'Start of the attention block. Accepts HH:MM or HH:MM:SS and is always stored and returned as HH:MM:SS',
    example: '08:00',
  })
  @IsString({ message: 'El campo hora de inicio debe ser texto.' })
  @Matches(TIME_REGEX, {
    message: 'El campo hora de inicio debe tener el formato HH:MM o HH:MM:SS.',
  })
  startTime: string;

  @ApiProperty({
    description:
      'End of the attention block. Must be greater than the start time',
    example: '13:00',
  })
  @IsString({ message: 'El campo hora de fin debe ser texto.' })
  @Matches(TIME_REGEX, {
    message: 'El campo hora de fin debe tener el formato HH:MM o HH:MM:SS.',
  })
  endTime: string;

  // ponytail: sin `= 30` a propósito, PartialType heredaría el default y PATCH
  // pisaría el slot_duration guardado cuando el cliente no manda el campo
  @ApiPropertyOptional({
    description: 'Length in minutes of each bookable slot inside the block',
    example: 30,
    default: 30,
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt({
    message: 'El campo duración del turno debe ser un número entero.',
  })
  @Min(1, { message: 'La duración del turno debe ser mayor que 0 minutos.' })
  @Max(1440, {
    message: 'La duración del turno no puede superar los 1440 minutos.',
  })
  slotDuration?: number;

  @ApiPropertyOptional({
    description:
      'When true the block repeats weekly and dayOfWeek is required. When false the block applies only to specificDate',
    example: true,
    default: true,
  })
  @TransformBoolean()
  @IsOptional()
  @IsBoolean({
    message: 'El campo recurrente debe ser un valor booleano.',
  })
  isRecurring?: boolean;

  @ApiPropertyOptional({
    description:
      'Day of the week the block applies to. Required when isRecurring is true and forbidden otherwise',
    enum: DayOfWeek,
    example: DayOfWeek.MONDAY,
  })
  @IsOptional()
  @IsEnum(DayOfWeek, {
    message: 'El campo día de la semana debe ser un valor entre 0 y 6.',
  })
  @Transform(({ value }) =>
    typeof value === 'string' && value !== '' ? Number(value) : value,
  )
  dayOfWeek?: DayOfWeek;

  @ApiPropertyOptional({
    description:
      'Exact date the block applies to (YYYY-MM-DD). Required when isRecurring is false and forbidden otherwise',
    example: '2026-10-15',
  })
  @IsOptional()
  @IsString({ message: 'El campo fecha debe ser una cadena de texto.' })
  @IsDateString(
    {},
    { message: 'El campo fecha debe tener el formato YYYY-MM-DD.' },
  )
  specificDate?: string;
}
