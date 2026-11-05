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
  Matches,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';

import { GenderType } from '../../../common/enums/gender-type.enum.js';
import { TransformBoolean } from '../../../common/dto/transform-boolean.js';

export class CreateAppointmentWithPatientDto {
  @ApiPropertyOptional({
    description: 'Primary clinical reason for booking the consultation',
    example: 'Routine checkup and blood pressure monitoring',
    maxLength: 255,
  })
  @IsOptional()
  @IsString({ message: 'El motivo debe ser una cadena de texto.' })
  @MaxLength(255, { message: 'El motivo no puede exceder los 255 caracteres.' })
  reason?: string;

  @ApiPropertyOptional({
    description: 'Additional clinical or administrative remarks',
    example: 'First-time patient; requested Spanish-speaking doctor',
    maxLength: 255,
  })
  @IsOptional()
  @IsString({ message: 'Las notas deben ser una cadena de texto.' })
  @MaxLength(255, {
    message: 'Las notas no pueden exceder los 255 caracteres.',
  })
  notes?: string;

  @ApiPropertyOptional({
    description:
      'Initial appointment status ID (references appointment_status table)',
    example: 1,
    type: Number,
    default: 1,
  })
  @IsOptional()
  @IsInt({ message: 'El ID del estado debe ser un número entero.' })
  @Min(1, { message: 'El ID del estado debe ser mayor a 0.' })
  @Type(() => Number)
  statusId?: number;

  @ApiProperty({
    description: 'Start date and time in UTC (ISO 8601 string)',
    example: '2026-10-28T09:00:00.000Z',
    type: String,
    format: 'date-time',
  })
  @IsNotEmpty({ message: 'La fecha de inicio es obligatoria.' })
  @IsString({
    message:
      'La fecha de inicio debe ser una cadena de texto en formato ISO 8601.',
  })
  start_time: string;

  @ApiProperty({
    description: 'End date and time in UTC (ISO 8601 string)',
    example: '2026-10-28T09:30:00.000Z',
    type: String,
    format: 'date-time',
  })
  @IsNotEmpty({ message: 'La fecha de fin es obligatoria.' })
  @IsString({
    message:
      'La fecha de fin debe ser una cadena de texto en formato ISO 8601.',
  })
  end_time: string;

  @ApiProperty({
    description: 'Identifier of the doctor assigned to the appointment',
    example: 1,
    type: Number,
  })
  @IsInt({ message: 'El ID del doctor debe ser un número entero.' })
  @Type(() => Number)
  @IsNotEmpty({ message: 'El ID del doctor es obligatorio.' })
  doctor_id: number;

  @ApiPropertyOptional({
    description: 'Identifier of the patient (optional if creating new patient)',
    example: 45,
    type: Number,
  })
  @IsOptional()
  @IsInt({ message: 'El ID del paciente debe ser un número entero.' })
  @Type(() => Number)
  patient_id?: number;

  @ApiPropertyOptional({
    description: 'Indicates if the patient attended as an unscheduled walk-in',
    default: false,
    example: false,
    type: Boolean,
  })
  @IsOptional()
  @IsBoolean({ message: 'El campo walk-in debe ser un valor booleano.' })
  @TransformBoolean()
  is_walk_in?: boolean;

  @ApiPropertyOptional({
    description:
      'Permite agendar en sobrecupo ignorando solapamiento de horario (uso exclusivo Walk-in)',
    default: false,
    example: false,
    type: Boolean,
  })
  @IsOptional()
  @IsBoolean({
    message: 'El campo allow_overbooking debe ser un valor booleano.',
  })
  @TransformBoolean()
  allow_overbooking?: boolean;

  // ========== Person Fields (required if patient_id not provided) ==========

  @ApiProperty({
    description: "Primary first name of the patient's person record.",
    example: 'Juan',
  })
  @IsOptional()
  @IsString({ message: 'El primer nombre debe ser una cadena de texto.' })
  @MaxLength(255, {
    message: 'El primer nombre no puede exceder los 255 caracteres.',
  })
  firstName?: string;

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
  @IsOptional()
  @IsString({ message: 'El apellido debe ser una cadena de texto.' })
  @MaxLength(255, {
    message: 'El apellido no puede exceder los 255 caracteres.',
  })
  lastName?: string;

  @ApiPropertyOptional({
    description:
      'Identifier of the application user account associated with this person, if exists.',
    example: 1,
  })
  @IsOptional()
  @IsInt({ message: 'El ID de usuario debe ser un número entero.' })
  @Type(() => Number)
  userId?: number;

  @ApiPropertyOptional({
    description: 'Contact phone number of the patient.',
    example: '71234567',
  })
  @IsOptional()
  @IsString({ message: 'El teléfono debe ser una cadena de texto.' })
  @ValidateIf((_, value) => value !== '' && value != null)
  @MaxLength(8, { message: 'El teléfono no puede exceder los 8 caracteres.' })
  @Matches(/^\d{8}$/, {
    message: 'El teléfono debe contener exactamente 8 dígitos.',
  })
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

  // ========== Patient Fields (required if patient_id not provided) ==========

  @ApiProperty({
    description: 'Birth date in ISO format (YYYY-MM-DD).',
    example: '1990-05-15',
  })
  @IsOptional()
  @IsDate({ message: 'La fecha de nacimiento debe ser una fecha válida.' })
  @Type(() => Date)
  birthDate?: Date;

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
  @IsOptional()
  @IsBoolean({
    message: 'El campo odontograma completo debe ser un valor booleano.',
  })
  @TransformBoolean()
  completeOdontogram?: boolean;

  @ApiProperty({
    description: 'Biological gender or legal gender identity.',
    enum: GenderType,
    example: GenderType.MALE,
  })
  @IsOptional()
  @IsEnum(GenderType, {
    message: `El género debe ser un valor válido (${Object.values(GenderType).join(', ')}).`,
  })
  gender?: GenderType;

  @ApiPropertyOptional({
    description:
      'Presence of Central Nervous System (SNC) conditions or complications.',
    example: false,
  })
  @IsOptional()
  @IsBoolean({
    message: 'El indicador de afecciones del SNC debe ser un valor booleano.',
  })
  @TransformBoolean()
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
  @TransformBoolean()
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
  @TransformBoolean()
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
  @TransformBoolean()
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
  @TransformBoolean()
  hasSrIssues?: boolean;

  @ApiPropertyOptional({
    description: 'Presence of Urinary System (SU) conditions or complications.',
    example: false,
  })
  @IsOptional()
  @IsBoolean({
    message: 'El indicador de afecciones del SU debe ser un valor booleano.',
  })
  @TransformBoolean()
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
  @TransformBoolean()
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
  @TransformBoolean()
  hasSgiIssues?: boolean;

  @ApiPropertyOptional({
    description:
      'Additional clinical observations and findings from the systemic review.',
    example: 'Evaluación normal',
    maxLength: 255,
  })
  @IsOptional()
  @IsString({
    message:
      'Las notas de evaluación de sistemas deben ser una cadena de texto.',
  })
  @MaxLength(255, {
    message:
      'Las notas de evaluación de sistemas no pueden exceder los 255 caracteres.',
  })
  systemEvaluationNotes?: string;

  @ApiPropertyOptional({
    description:
      'Profile picture file (handled via multipart/form-data file upload).',
    type: 'string',
    format: 'binary',
  })
  @IsOptional()
  profilePicture?: any;
}
