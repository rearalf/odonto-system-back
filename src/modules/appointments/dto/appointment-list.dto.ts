import { ApiProperty } from '@nestjs/swagger';

export class AppointmentListDto {
  @ApiProperty({ example: 101 })
  id: number;

  @ApiProperty({ example: 450 })
  patientId: number;

  @ApiProperty({ example: 12 })
  doctorId: number;

  @ApiProperty({ example: '2026-11-04T09:30:00.000Z' })
  startTime: Date;

  @ApiProperty({ example: '2026-11-04T10:15:00.000Z' })
  endTime: Date;

  @ApiProperty({
    description: 'Status name from appointment_status table',
    example: 'scheduled',
  })
  status: string;

  @ApiProperty({ example: 'Routine checkup' })
  reason?: string;

  @ApiProperty({ example: false })
  isWalkIn: boolean;

  @ApiProperty({ example: 'Juan Carlos Pérez' })
  patientFullName: string;

  @ApiProperty({ example: 'María Elena González' })
  doctorFullName: string;

  @ApiProperty({
    description: 'Color for UI display from appointment_status table',
    example: 'blue',
  })
  statusColor: string;

  @ApiProperty({ example: 45 })
  durationMinutes: number;

  @ApiProperty({ example: true })
  rescheduled: boolean;

  @ApiProperty({ example: '2026-10-01T12:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-10-15T14:30:00.000Z', nullable: true })
  modifiedAt?: Date;
}

export class PaginatedAppointmentsResponseDto {
  @ApiProperty({ type: [AppointmentListDto] })
  data: AppointmentListDto[];

  @ApiProperty({
    type: 'object',
    properties: {
      total_count: { type: 'number', example: 150 },
      total_pages: { type: 'number', example: 15 },
      page: { type: 'number', example: 1 },
      per_page: { type: 'number', example: 10 },
    },
    nullable: true,
  })
  meta: {
    total_count: number;
    total_pages: number;
    page: number;
    per_page: number;
  } | null;
}
