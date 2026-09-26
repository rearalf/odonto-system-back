import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { BaseEntity } from '../../../common/database/base.entity.js';
import { GenderType } from '../../../common/enums/gender-type.enum.js';
import { Person } from '../../persons/entities/person.entity.js';

@Entity('patient')
export class Patient extends BaseEntity {
  @ApiProperty({
    description: 'Associated personal details of the patient',
    type: () => Person,
  })
  @OneToOne(() => Person, {
    nullable: false,
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn({ name: 'person_id' })
  person: Person;

  @ApiProperty({
    description: 'Unique foreign key referencing the associated person',
    example: 10,
  })
  @Column({
    name: 'person_id',
    type: 'int',
    unique: true,
    nullable: false,
    comment: 'Foreign key referencing person(id)',
  })
  personId: number;

  @ApiProperty({
    description: "Patient's date of birth (ISO format: YYYY-MM-DD)",
    example: '1995-04-15',
    type: String,
    format: 'date',
  })
  @Column({
    name: 'birth_date',
    type: 'date',
    nullable: false,
    comment: 'Date of birth of the patient',
  })
  birthDate: Date;

  @ApiProperty({
    description: 'Biological or assigned gender of the patient',
    enum: GenderType,
    example: GenderType.MALE,
  })
  @Column({
    type: 'enum',
    enum: GenderType,
    nullable: false,
    comment: 'Gender of the patient (enum GenderType)',
  })
  gender: GenderType;

  @ApiPropertyOptional({
    description:
      'Relevant medical history, pathological background, and past surgeries',
    example: 'Controlled arterial hypertension diagnosed in 2020.',
    nullable: true,
  })
  @Column({
    name: 'medical_history',
    type: 'text',
    nullable: true,
    comment: 'Medical history and pathological background',
  })
  medicalHistory: string | null;

  @ApiPropertyOptional({
    description:
      'Known allergic reactions to drugs, foods, or clinical materials',
    example: 'Allergic to penicillin and latex.',
    nullable: true,
  })
  @Column({
    name: 'allergic_reactions',
    type: 'text',
    nullable: true,
    comment: 'Known allergies and adverse reactions',
  })
  allergicReactions: string | null;

  @ApiPropertyOptional({
    description: 'Ongoing systemic medical treatments or daily prescriptions',
    example: 'Losartan 50mg every 24 hours.',
    nullable: true,
  })
  @Column({
    name: 'current_systemic_treatment',
    type: 'text',
    nullable: true,
    comment: 'Current systemic pharmacological treatment',
  })
  currentSystemicTreatment: string | null;

  @ApiPropertyOptional({
    description: 'Summary and remarks on recent clinical laboratory results',
    example:
      'Fasting glucose: 95 mg/dL, complete blood count within normal range.',
    nullable: true,
  })
  @Column({
    name: 'lab_results',
    type: 'text',
    nullable: true,
    comment: 'Clinical laboratory test results summary',
  })
  labResults: string | null;

  @ApiProperty({
    description:
      'Indicates whether the initial odontogram charting is completed',
    example: false,
    default: false,
  })
  @Column({
    name: 'complete_odontogram',
    type: 'boolean',
    nullable: false,
    default: false,
    comment: 'Flag indicating whether initial odontogram charting is completed',
  })
  completeOdontogram: boolean;

  @ApiProperty({
    description:
      'Indicates past or present Central Nervous System (CNS/SNC) disorders',
    example: false,
    default: false,
  })
  @Column({
    name: 'has_snc_issues',
    type: 'boolean',
    nullable: false,
    default: false,
    comment: 'Flag for Central Nervous System (SNC/CNS) issues or history',
  })
  hasSncIssues: boolean;

  @ApiProperty({
    description:
      'Indicates past or present Cardiovascular / Vascular System (CVS/SVC) disorders',
    example: false,
    default: false,
  })
  @Column({
    name: 'has_svc_issues',
    type: 'boolean',
    nullable: false,
    default: false,
    comment: 'Flag for Cardiovascular System (SVC/CVS) issues or history',
  })
  hasSvcIssues: boolean;

  @ApiProperty({
    description: 'Indicates past or present Endocrine System (ES/SE) disorders',
    example: false,
    default: false,
  })
  @Column({
    name: 'has_se_issues',
    type: 'boolean',
    nullable: false,
    default: false,
    comment: 'Flag for Endocrine System (SE/ES) issues or history',
  })
  hasSeIssues: boolean;

  @ApiProperty({
    description:
      'Indicates past or present Musculoskeletal System (MS/SME) disorders',
    example: false,
    default: false,
  })
  @Column({
    name: 'has_sme_issues',
    type: 'boolean',
    nullable: false,
    default: false,
    comment: 'Flag for Musculoskeletal System (SME/MS) issues or history',
  })
  hasSmeIssues: boolean;

  @ApiProperty({
    description:
      'Indicates past or present Respiratory System (RS/SR) disorders',
    example: false,
    default: false,
  })
  @Column({
    name: 'has_sr_issues',
    type: 'boolean',
    nullable: false,
    default: false,
    comment: 'Flag for Respiratory System (SR/RS) issues or history',
  })
  hasSrIssues: boolean;

  @ApiProperty({
    description: 'Indicates past or present Urinary System (US/SU) disorders',
    example: false,
    default: false,
  })
  @Column({
    name: 'has_su_issues',
    type: 'boolean',
    nullable: false,
    default: false,
    comment: 'Flag for Urinary System (SU/US) issues or history',
  })
  hasSuIssues: boolean;

  @ApiProperty({
    description:
      'Indicates past or present Genitourinary System (GUS/SGU) disorders',
    example: false,
    default: false,
  })
  @Column({
    name: 'has_sgu_issues',
    type: 'boolean',
    nullable: false,
    default: false,
    comment: 'Flag for Genitourinary System (SGU/GUS) issues or history',
  })
  hasSguIssues: boolean;

  @ApiProperty({
    description:
      'Indicates past or present Gastrointestinal System (GIS/SGI) disorders',
    example: false,
    default: false,
  })
  @Column({
    name: 'has_sgi_issues',
    type: 'boolean',
    nullable: false,
    default: false,
    comment: 'Flag for Gastrointestinal System (SGI/GIS) issues or history',
  })
  hasSgiIssues: boolean;

  @ApiPropertyOptional({
    description:
      'Detailed clinical observations and remarks regarding system evaluation',
    example:
      'Patient reports mild occasional acid reflux managed with OTC antacids.',
    maxLength: 255,
    nullable: true,
  })
  @Column({
    name: 'system_evaluation_notes',
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: 'Detailed clinical notes from the systems review',
  })
  systemEvaluationNotes: string | null;
}
