import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DayOfWeek } from '../../../common/enums/day-of-week.enum.js';

export class DoctorAvailabilityResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  doctorId: number;

  @ApiProperty({ example: '08:00:00' })
  startTime: string;

  @ApiProperty({ example: '13:00:00' })
  endTime: string;

  @ApiProperty({ example: 30 })
  slotDuration: number;

  @ApiProperty({ example: 1 })
  maxPatientsPerSlot: number;

  @ApiProperty({ example: true })
  isRecurring: boolean;

  @ApiPropertyOptional({
    enum: DayOfWeek,
    example: DayOfWeek.MONDAY,
    nullable: true,
  })
  dayOfWeek: DayOfWeek | null;

  @ApiPropertyOptional({ example: '2026-10-15', nullable: true })
  specificDate: string | null;
}
