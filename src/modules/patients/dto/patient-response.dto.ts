import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Type } from 'class-transformer';
import { GenderType } from '../../../common/enums/gender-type.enum.js';

class PersonTypeResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Natural Person' })
  name: string;

  @ApiPropertyOptional({ example: 'Individual human being' })
  description: string | null;

  @Exclude()
  createdAt: Date;

  @Exclude()
  updatedAt: Date;

  @Exclude()
  deletedAt: Date | null;
}

class PersonResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Juan' })
  firstName: string;

  @ApiPropertyOptional({ example: 'Carlos' })
  middleName: string | null;

  @ApiProperty({ example: 'Pérez' })
  lastName: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/avatar.jpg' })
  profilePictureUrl: string | null;

  @ApiPropertyOptional({ example: '71234567' })
  phone: string | null;

  @ApiPropertyOptional({ example: 'Av. Corrientes 1234' })
  address: string | null;

  @ApiPropertyOptional({ example: 'Odontólogo' })
  occupation: string | null;

  @ApiProperty({ type: () => PersonTypeResponseDto })
  @Type(() => PersonTypeResponseDto)
  personType: PersonTypeResponseDto;

  @Exclude()
  createdAt: Date;

  @Exclude()
  updatedAt: Date;

  @Exclude()
  deletedAt: Date | null;

  @Exclude()
  userId: number | null;

  @Exclude()
  personTypeId: number;

  @Exclude()
  profilePictureName: string | null;
}

class SystemicReviewDto {
  @ApiProperty({ example: false })
  hasSncIssues: boolean;

  @ApiProperty({ example: false })
  hasSvcIssues: boolean;

  @ApiProperty({ example: false })
  hasSeIssues: boolean;

  @ApiProperty({ example: false })
  hasSmeIssues: boolean;

  @ApiProperty({ example: false })
  hasSrIssues: boolean;

  @ApiProperty({ example: false })
  hasSuIssues: boolean;

  @ApiProperty({ example: false })
  hasSguIssues: boolean;

  @ApiProperty({ example: false })
  hasSgiIssues: boolean;

  @ApiPropertyOptional({
    example: 'Patient reports mild occasional acid reflux',
  })
  systemEvaluationNotes: string | null;
}

export class PatientResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ type: () => PersonResponseDto })
  @Type(() => PersonResponseDto)
  person: PersonResponseDto;

  @ApiProperty({ example: '1995-04-15' })
  birthDate: Date;

  @ApiProperty({ enum: GenderType, example: GenderType.MALE })
  gender: GenderType;

  @ApiPropertyOptional({ example: 'Controlled arterial hypertension' })
  medicalHistory: string | null;

  @ApiPropertyOptional({ example: 'Allergic to penicillin' })
  allergicReactions: string | null;

  @ApiPropertyOptional({ example: 'Losartan 50mg every 24 hours' })
  currentSystemicTreatment: string | null;

  @ApiPropertyOptional({ example: 'Fasting glucose: 95 mg/dL' })
  labResults: string | null;

  @ApiProperty({ example: false })
  completeOdontogram: boolean;

  @ApiProperty({ type: () => SystemicReviewDto })
  @Type(() => SystemicReviewDto)
  systemicReview: SystemicReviewDto;

  @Exclude()
  createdAt: Date;

  @Exclude()
  updatedAt: Date;

  @Exclude()
  deletedAt: Date | null;

  @Exclude()
  personId: number;
}
