import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Matches } from 'class-validator';

export class QueryDoctorSlotsDto {
  @ApiProperty({
    description: 'Date to calculate available slots for (YYYY-MM-DD)',
    example: '2026-10-20',
  })
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'date must be in YYYY-MM-DD format',
  })
  date: string;
}
