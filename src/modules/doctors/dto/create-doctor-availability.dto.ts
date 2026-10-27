import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';
import { DayOfWeek } from '../../../common/enums/day-of-week.enum.js';

export class CreateDoctorAvailabilityDto {
  @ApiProperty({
    description: 'Start time of the schedule block in 24h format (HH:MM:SS)',
    example: '08:00:00',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, {
    message: 'startTime must be a valid time in HH:MM:SS format',
  })
  startTime: string;

  @ApiProperty({
    description: 'End time of the schedule block in 24h format (HH:MM:SS)',
    example: '12:00:00',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, {
    message: 'endTime must be a valid time in HH:MM:SS format',
  })
  endTime: string;

  @ApiPropertyOptional({
    description: 'Duration in minutes of each appointment slot',
    example: 30,
    default: 30,
    minimum: 5,
    maximum: 240,
  })
  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(240)
  slotDuration?: number = 30;

  @ApiPropertyOptional({
    description: 'Maximum number of patients allowed per single slot',
    example: 1,
    default: 1,
    minimum: 1,
    maximum: 20,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  maxPatientsPerSlot?: number = 1;

  @ApiProperty({
    description:
      'True if the schedule repeats every week; false for a single specific date',
    example: true,
    default: true,
  })
  @IsNotEmpty()
  @IsBoolean()
  isRecurring: boolean;

  @ApiPropertyOptional({
    description:
      'Day of the week (0 = Sunday ... 6 = Saturday). Required when isRecurring is true',
    enum: DayOfWeek,
    example: DayOfWeek.MONDAY,
  })
  @ValidateIf((o: CreateDoctorAvailabilityDto) => o.isRecurring === true)
  @IsNotEmpty({ message: 'dayOfWeek is required when isRecurring is true' })
  @IsEnum(DayOfWeek)
  dayOfWeek?: DayOfWeek;

  @ApiPropertyOptional({
    description:
      'Specific date (YYYY-MM-DD). Required when isRecurring is false',
    example: '2026-10-25',
  })
  @ValidateIf((o: CreateDoctorAvailabilityDto) => o.isRecurring === false)
  @IsNotEmpty({ message: 'specificDate is required when isRecurring is false' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'specificDate must be in YYYY-MM-DD format',
  })
  specificDate?: string;
}
