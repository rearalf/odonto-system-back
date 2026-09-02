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
  MaxLength,
} from 'class-validator';
import { GenderType } from '../../../common/enums/gender-type.enum.js';

export class CreatePatientDto {
  @ApiProperty({ example: 'Juan' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  firstName: string;

  @ApiPropertyOptional({ example: 'Carlos' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  middleName?: string;

  @ApiProperty({ example: 'Pérez' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  lastName: string;

  @ApiPropertyOptional({ example: 'profile.jpg' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  profilePictureName?: string;

  @ApiPropertyOptional({ example: 'https://example.com/profile.jpg' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  profilePictureUrl?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  userId?: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  personTypeId: number;

  @ApiPropertyOptional({ example: '123456789' })
  @IsOptional()
  @IsString()
  @MaxLength(9)
  phone?: string;

  @ApiPropertyOptional({ example: 'Av. Corrientes 1234' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  address?: string;

  @ApiPropertyOptional({ example: 'Odontólogo' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  occupation?: string;

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
