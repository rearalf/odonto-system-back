import { ApiProperty } from '@nestjs/swagger';

export class AppointmentStatusDto {
  @ApiProperty({ description: 'Unique identifier for the status', example: 1 })
  id: number;

  @ApiProperty({
    description: 'Unique key name for the status (used in code)',
    example: 'scheduled',
  })
  name: string;

  @ApiProperty({ description: 'Hex color for UI display', example: '#0ea5e9' })
  color: string;

  @ApiProperty({
    description: 'Human-readable description',
    example: 'Cita programada',
    nullable: true,
  })
  description?: string;
}
