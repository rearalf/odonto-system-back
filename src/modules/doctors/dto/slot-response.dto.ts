import { ApiProperty } from '@nestjs/swagger';

export class DoctorSlotResponseDto {
  @ApiProperty({ example: '08:00:00' })
  startTime: string;

  @ApiProperty({ example: '08:30:00' })
  endTime: string;

  @ApiProperty({
    description: 'Total capacity configured for this slot',
    example: 2,
  })
  maxCapacity: number;

  @ApiProperty({
    description: 'Current number of active appointments in this slot',
    example: 1,
  })
  occupiedSpots: number;

  @ApiProperty({
    description: 'Remaining spots available for booking',
    example: 1,
  })
  availableSpots: number;

  @ApiProperty({
    description: 'True if availableSpots > 0 and not blocked by unavailability',
    example: true,
  })
  isAvailable: boolean;
}
