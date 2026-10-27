import { ApiProperty } from '@nestjs/swagger';

export class AvailableSlotDto {
  @ApiProperty({
    description: 'Start of the available consultation window (ISO 8601)',
    example: '2026-10-15T08:00:00.000Z',
  })
  start_time: string;

  @ApiProperty({
    description: 'End of the available consultation window (ISO 8601)',
    example: '2026-10-15T08:30:00.000Z',
  })
  end_time: string;
}
