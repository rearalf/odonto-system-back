import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { GenderType } from '../../../common/enums/gender-type.enum.js';

export class FilterPatientDto {
  @ApiPropertyOptional({ example: 'Pérez' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ enum: GenderType })
  @IsOptional()
  @IsEnum(GenderType)
  gender?: GenderType;
}
