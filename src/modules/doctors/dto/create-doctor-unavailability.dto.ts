import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateDoctorUnavailabilityDto {
  @ApiProperty({
    description: 'Start timestamp of the unavailability (ISO 8601)',
    example: '2026-10-20T14:00:00.000Z',
  })
  @IsNotEmpty()
  @IsDateString()
  startTime: string;

  @ApiProperty({
    description: 'End timestamp of the unavailability (ISO 8601)',
    example: '2026-10-20T17:00:00.000Z',
  })
  @IsNotEmpty()
  @IsDateString()
  endTime: string;

  @ApiPropertyOptional({
    description: 'Reason for the absence or block',
    example: 'Congreso Dental Nacional',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  reason?: string;
}
