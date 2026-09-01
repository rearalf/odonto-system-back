import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { GenderType } from '../../../common/enums/gender-type.enum.js';
import { CreatePersonDto } from '../../persons/dto/create-person.dto.js';

export class CreatePatientDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  personId: number;

  @ApiPropertyOptional({
    description: 'Datos de persona anidados (se crea si no se envía personId)',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreatePersonDto)
  person?: CreatePersonDto;

  @ApiProperty({ example: '1990-05-15' })
  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  birthDate: Date;

  @ApiPropertyOptional({ example: 'Sin antecedentes relevantes' })
  @IsOptional()
  @IsString()
  medicalHistory?: string;

  @ApiPropertyOptional({ example: 'Penicilina' })
  @IsOptional()
  @IsString()
  allergicReactions?: string;

  @ApiPropertyOptional({ example: 'Ibuprofeno 400mg diario' })
  @IsOptional()
  @IsString()
  currentSystemicTreatment?: string;

  @ApiPropertyOptional({ example: 'Hemoglobina: 14 g/dL' })
  @IsOptional()
  @IsString()
  labResults?: string;

  @ApiProperty({ example: false })
  @IsBoolean()
  @IsNotEmpty()
  completeOdontogram: boolean;

  @ApiProperty({ enum: GenderType, example: GenderType.MALE })
  @IsEnum(GenderType)
  @IsNotEmpty()
  gender: GenderType;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  hasSncIssues?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  hasSvcIssues?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  hasSeIssues?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  hasSmeIssues?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  hasSrIssues?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  hasSuIssues?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  hasSguIssues?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  hasSgiIssues?: boolean;

  @ApiPropertyOptional({ example: 'Evaluación normal' })
  @IsOptional()
  @IsString()
  systemEvaluationNotes?: string;
}
