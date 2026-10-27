import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AppointmentStatus } from '../../../common/enums/appointment-status.js';

export class CreateAppointmentDto {
  @ApiPropertyOptional({
    description: 'Primary clinical reason for booking the consultation',
    example: 'Routine checkup and blood pressure monitoring',
    maxLength: 255,
  })
  reason?: string;

  @ApiPropertyOptional({
    description: 'Additional clinical or administrative remarks',
    example: 'First-time patient; requested Spanish-speaking doctor',
    maxLength: 255,
  })
  notes?: string;

  @ApiPropertyOptional({
    description: 'Initial appointment status',
    enum: AppointmentStatus,
    default: AppointmentStatus.SCHEDULED,
    example: AppointmentStatus.SCHEDULED,
  })
  status?: AppointmentStatus;

  @ApiProperty({
    description: 'Start date and time in UTC (ISO 8601 string)',
    example: '2026-10-28T09:00:00.000Z',
    type: String,
    format: 'date-time',
  })
  start_time: string;

  @ApiProperty({
    description: 'End date and time in UTC (ISO 8601 string)',
    example: '2026-10-28T09:30:00.000Z',
    type: String,
    format: 'date-time',
  })
  end_time: string;

  @ApiProperty({
    description: 'Identifier of the doctor assigned to the appointment',
    example: 1,
    type: Number,
  })
  doctor_id: number;

  @ApiProperty({
    description: 'Identifier of the patient receiving the consultation',
    example: 45,
    type: Number,
  })
  patient_id: number;

  @ApiPropertyOptional({
    description: 'Indicates if the patient attended as an unscheduled walk-in',
    default: false,
    example: false,
    type: Boolean,
  })
  is_walk_in?: boolean;
}
