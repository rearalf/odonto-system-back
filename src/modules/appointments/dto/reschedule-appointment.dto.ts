import { ApiProperty } from '@nestjs/swagger';

export class RescheduleAppointmentDto {
  @ApiProperty({
    description: 'New scheduled start timestamp (ISO 8601 string)',
    example: '2026-10-30T14:00:00.000Z',
    type: String,
    format: 'date-time',
  })
  start_time: string;

  @ApiProperty({
    description: 'New scheduled end timestamp (ISO 8601 string)',
    example: '2026-10-30T14:45:00.000Z',
    type: String,
    format: 'date-time',
  })
  end_time: string;

  @ApiProperty({
    description: 'Detailed explanation for rescheduling the appointment',
    example: 'Patient requested shift to afternoon due to work conflict',
    maxLength: 255,
  })
  modification_reason: string;
}
