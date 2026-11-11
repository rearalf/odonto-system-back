import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class AppointmentStatusResponseDto {
  @ApiProperty({ description: 'Unique identifier for the status', example: 2 })
  id: number;

  @ApiProperty({
    description: 'Unique key name for the status (used in code)',
    example: 'confirmed',
  })
  name: string;

  @ApiProperty({ description: 'Hex color for UI display', example: '#10b981' })
  color: string;

  @ApiPropertyOptional({
    description: 'Human-readable description',
    example: 'Cita confirmada',
    nullable: true,
  })
  description?: string | null;
}

export class UpdateAppointmentStatusResponseDto {
  @ApiProperty({ description: 'Appointment identifier', example: 101 })
  id: number;

  @ApiProperty({
    description: 'Target lifecycle status ID for the appointment',
    example: 2,
  })
  statusId: number;

  @ApiProperty({
    type: () => AppointmentStatusResponseDto,
    description: 'New status details (name, color, description)',
  })
  status: AppointmentStatusResponseDto;
}
