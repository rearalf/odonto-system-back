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
  @ApiProperty({
    description: "Primary first name of the patient's person record.",
    example: 'Juan',
  })
  @IsString({ message: 'El primer nombre debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El primer nombre es obligatorio.' })
  @MaxLength(255, {
    message: 'El primer nombre no puede exceder los 255 caracteres.',
  })
  firstName: string;

  @ApiPropertyOptional({
    description: "Middle or second name of the patient's person record.",
    example: 'Carlos',
  })
  @IsOptional()
  @IsString({ message: 'El segundo nombre debe ser una cadena de texto.' })
  @MaxLength(255, {
    message: 'El segundo nombre no puede exceder los 255 caracteres.',
  })
  middleName?: string;

  @ApiProperty({
    description: "Primary last name/surname of the patient's person record.",
    example: 'Pérez',
  })
  @IsString({ message: 'El apellido debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El apellido es obligatorio.' })
  @MaxLength(255, {
    message: 'El apellido no puede exceder los 255 caracteres.',
  })
  lastName: string;

  @ApiPropertyOptional({
    description: 'Original or generated filename of the stored profile avatar.',
    example: 'profile.jpg',
  })
  @IsOptional()
  @IsString({
    message:
      'El nombre del archivo de la foto de perfil debe ser una cadena de texto.',
  })
  @MaxLength(255, {
    message:
      'El nombre del archivo de la foto de perfil no puede exceder los 255 caracteres.',
  })
  profilePictureName?: string;

  @ApiPropertyOptional({
    description:
      'Public or presigned URL where the patient profile image is hosted.',
    example: 'https://example.com/profile.jpg',
  })
  @IsOptional()
  @IsString({
    message: 'La URL de la foto de perfil debe ser una cadena de texto válida.',
  })
  @MaxLength(255, {
    message: 'La URL de la foto de perfil no puede exceder los 255 caracteres.',
  })
  profilePictureUrl?: string;

  @ApiPropertyOptional({
    description:
      'Identifier of the application user account associated with this person, if exists.',
    example: 1,
  })
  @IsOptional()
  @IsInt({ message: 'El ID de usuario debe ser un número entero.' })
  userId?: number;

  @ApiPropertyOptional({
    description: 'Contact phone number of the patient.',
    example: '123456789',
  })
  @IsOptional()
  @IsString({ message: 'El teléfono debe ser una cadena de texto.' })
  @MaxLength(9, { message: 'El teléfono no puede exceder los 9 caracteres.' })
  phone?: string;

  @ApiPropertyOptional({
    description: 'Residential or correspondence address.',
    example: 'Av. Corrientes 1234',
  })
  @IsOptional()
  @IsString({ message: 'La dirección debe ser una cadena de texto.' })
  @MaxLength(100, {
    message: 'La dirección no puede exceder los 100 caracteres.',
  })
  address?: string;

  @ApiPropertyOptional({
    description: 'Current employment, trade, or profession.',
    example: 'Odontólogo',
  })
  @IsOptional()
  @IsString({ message: 'La ocupación debe ser una cadena de texto.' })
  @MaxLength(50, {
    message: 'La ocupación no puede exceder los 50 caracteres.',
  })
  occupation?: string;

  @ApiProperty({
    description: 'Birth date in ISO format (YYYY-MM-DD).',
    example: '1990-05-15',
  })
  @IsDate({ message: 'La fecha de nacimiento debe ser una fecha válida.' })
  @Type(() => Date)
  @IsNotEmpty({ message: 'La fecha de nacimiento es obligatoria.' })
  birthDate: Date;

  @ApiPropertyOptional({
    description:
      'Summary of past clinical background, chronic illnesses, and medical history.',
    example: 'Sin antecedentes relevantes',
  })
  @IsOptional()
  @IsString({ message: 'El historial médico debe ser una cadena de texto.' })
  medicalHistory?: string;

  @ApiPropertyOptional({
    description:
      'Known drug, food, or material allergies and adverse reactions.',
    example: 'Penicilina',
  })
  @IsOptional()
  @IsString({
    message: 'Las reacciones alérgicas deben ser una cadena de texto.',
  })
  allergicReactions?: string;

  @ApiPropertyOptional({
    description: 'Current prescribed medications or active systemic therapies.',
    example: 'Ibuprofeno 400mg diario',
  })
  @IsOptional()
  @IsString({
    message: 'El tratamiento sistémico actual debe ser una cadena de texto.',
  })
  currentSystemicTreatment?: string;

  @ApiPropertyOptional({
    description:
      'Recent clinical laboratory findings, bloodwork, or test annotations.',
    example: 'Hemoglobina: 14 g/dL',
  })
  @IsOptional()
  @IsString({
    message: 'Los resultados de laboratorio deben ser una cadena de texto.',
  })
  labResults?: string;

  @ApiProperty({
    description:
      'Flags whether the initial comprehensive odontogram evaluation has been completed.',
    example: false,
  })
  @IsBoolean({
    message: 'El campo odontograma completo debe ser un valor booleano.',
  })
  @IsNotEmpty({ message: 'El estado del odontograma completo es obligatorio.' })
  completeOdontogram: boolean;

  @ApiProperty({
    description: 'Biological gender or legal gender identity.',
    enum: GenderType,
    example: GenderType.MALE,
  })
  @IsEnum(GenderType, {
    message: `El género debe ser un valor válido (${Object.values(GenderType).join(', ')}).`,
  })
  @IsNotEmpty({ message: 'El género es obligatorio.' })
  gender: GenderType;

  @ApiPropertyOptional({
    description:
      'Presence of Central Nervous System (SNC) conditions or complications.',
    example: false,
  })
  @IsOptional()
  @IsBoolean({
    message: 'El indicador de afecciones del SNC debe ser un valor booleano.',
  })
  hasSncIssues?: boolean;

  @ApiPropertyOptional({
    description:
      'Presence of Cardiovascular System (SVC) conditions or complications.',
    example: false,
  })
  @IsOptional()
  @IsBoolean({
    message: 'El indicador de afecciones del SVC debe ser un valor booleano.',
  })
  hasSvcIssues?: boolean;

  @ApiPropertyOptional({
    description:
      'Presence of Endocrine System (SE) conditions or complications.',
    example: false,
  })
  @IsOptional()
  @IsBoolean({
    message: 'El indicador de afecciones del SE debe ser un valor booleano.',
  })
  hasSeIssues?: boolean;

  @ApiPropertyOptional({
    description:
      'Presence of Musculoskeletal System (SME) conditions or complications.',
    example: false,
  })
  @IsOptional()
  @IsBoolean({
    message: 'El indicador de afecciones del SME debe ser un valor booleano.',
  })
  hasSmeIssues?: boolean;

  @ApiPropertyOptional({
    description:
      'Presence of Respiratory System (SR) conditions or complications.',
    example: false,
  })
  @IsOptional()
  @IsBoolean({
    message: 'El indicador de afecciones del SR debe ser un valor booleano.',
  })
  hasSrIssues?: boolean;

  @ApiPropertyOptional({
    description: 'Presence of Urinary System (SU) conditions or complications.',
    example: false,
  })
  @IsOptional()
  @IsBoolean({
    message: 'El indicador de afecciones del SU debe ser un valor booleano.',
  })
  hasSuIssues?: boolean;

  @ApiPropertyOptional({
    description:
      'Presence of Genitourinary System (SGU) conditions or complications.',
    example: false,
  })
  @IsOptional()
  @IsBoolean({
    message: 'El indicador de afecciones del SGU debe ser un valor booleano.',
  })
  hasSguIssues?: boolean;

  @ApiPropertyOptional({
    description:
      'Presence of Gastrointestinal System (SGI) conditions or complications.',
    example: false,
  })
  @IsOptional()
  @IsBoolean({
    message: 'El indicador de afecciones del SGI debe ser un valor booleano.',
  })
  hasSgiIssues?: boolean;

  @ApiPropertyOptional({
    description:
      'Additional clinical observations and findings from the systemic review.',
    example: 'Evaluación normal',
  })
  @IsOptional()
  @IsString({
    message:
      'Las notas de evaluación de sistemas deben ser una cadena de texto.',
  })
  systemEvaluationNotes?: string;
}
