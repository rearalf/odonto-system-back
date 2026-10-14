import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DoctorUnavailabilityResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  doctorId: number;

  @ApiProperty({ example: '2026-10-15T14:00:00.000Z' })
  startTime: Date;

  @ApiProperty({ example: '2026-10-15T18:00:00.000Z' })
  endTime: Date;

  @ApiPropertyOptional({ example: 'Vacaciones', nullable: true })
  reason: string | null;
}
