import { ApiProperty } from '@nestjs/swagger';

export class AvailableSlotsQueryDto {
  @ApiProperty({
    description: 'Target date to query open slots (YYYY-MM-DD)',
    example: '2026-10-15',
    type: String,
  })
  date: string;
}
