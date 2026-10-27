import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, ValidateNested } from 'class-validator';

import { CreateDoctorAvailabilityDto } from './create-doctor-availability.dto.js';

export class BulkDoctorAvailabilityDto {
  @ApiProperty({
    description: 'Array of schedule blocks for the doctor weekly template',
    type: [CreateDoctorAvailabilityDto],
  })
  @IsArray()
  @ArrayNotEmpty({ message: 'blocks array cannot be empty' })
  @ValidateNested({ each: true })
  @Type(() => CreateDoctorAvailabilityDto)
  blocks: CreateDoctorAvailabilityDto[];
}
