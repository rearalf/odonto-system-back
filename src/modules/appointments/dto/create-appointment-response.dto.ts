import { ApiProperty } from '@nestjs/swagger';

export class CreateAppointmentResponseDto {
  @ApiProperty({ example: 101 })
  id: number;

  @ApiProperty({ example: 450 })
  patientId: number;

  @ApiProperty({ example: 'Juan Carlos Pérez' })
  patientFullName: string;

  @ApiProperty({ example: 12 })
  doctorId: number;

  @ApiProperty({ example: 'María Elena González' })
  doctorFullName: string;

  @ApiProperty({ example: '2026-11-04T09:30:00.000Z' })
  startTime: Date;

  @ApiProperty({ example: '2026-11-04T10:15:00.000Z' })
  endTime: Date;

  @ApiProperty({
    description: 'Status name from appointment_status table',
    example: 'scheduled',
  })
  status: string;

  @ApiProperty({
    description: 'Color for UI display from appointment_status table',
    example: 'blue',
  })
  statusColor: string;
}
