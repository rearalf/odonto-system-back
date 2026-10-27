import {
  Index,
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  type Relation,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { BaseEntity } from '../../../common/database/base.entity.js';
import { AppointmentStatus } from '../../../common/enums/appointment-status.js';

import { Doctor } from '../../doctors/entities/doctor.entity.js';
import { Patient } from '../../patients/entities/patient.entity.js';

@Entity('appointment')
export class Appointment extends BaseEntity {
  @ApiPropertyOptional({
    description: 'Primary reason for the medical consultation',
    example: 'Routine cardiology follow-up and chest tightness evaluation',
    maxLength: 255,
  })
  @Column({
    type: 'varchar',
    length: 255,
    name: 'reason',
    nullable: true,
    comment: 'Primary reason for the medical consultation',
  })
  reason?: string;

  @ApiPropertyOptional({
    description: 'Additional notes or administrative remarks',
    example: 'Patient requested Spanish-speaking consultation if available',
    maxLength: 255,
  })
  @Column({
    type: 'varchar',
    length: 255,
    name: 'notes',
    nullable: true,
    comment: 'Additional notes or administrative remarks',
  })
  notes?: string;

  @ApiProperty({
    description: 'Current lifecycle status of the appointment',
    enum: AppointmentStatus,
    default: AppointmentStatus.SCHEDULED,
    example: AppointmentStatus.SCHEDULED,
  })
  @Column({
    type: 'enum',
    enum: AppointmentStatus,
    enumName: 'appointment_status',
    name: 'status',
    default: AppointmentStatus.SCHEDULED,
    comment: 'Current status of the appointment',
  })
  status: AppointmentStatus;

  @ApiProperty({
    description: 'Scheduled start timestamp with timezone (ISO 8601)',
    example: '2026-11-04T09:30:00.000Z',
    type: String,
    format: 'date-time',
  })
  @Column({
    type: 'timestamptz',
    name: 'start_time',
    comment: 'Scheduled start date and time with time zone',
  })
  startTime: Date;

  @ApiProperty({
    description: 'Scheduled or actual end timestamp with timezone (ISO 8601)',
    example: '2026-11-04T10:15:00.000Z',
    type: String,
    format: 'date-time',
  })
  @Column({
    type: 'timestamptz',
    name: 'end_time',
    comment: 'Scheduled or actual end date and time with time zone',
  })
  endTime: Date;

  @ApiPropertyOptional({
    description: 'Timestamp when a manual reschedule or update took place',
    example: '2026-11-01T15:20:00.000Z',
    type: String,
    format: 'date-time',
  })
  @Column({
    type: 'timestamp',
    name: 'modified_at',
    nullable: true,
    comment: 'Timestamp when a manual change or reschedule took place',
  })
  modifiedAt?: Date;

  @ApiPropertyOptional({
    description: 'Stated reason for modifying or rescheduling the appointment',
    example: 'Rescheduled upon patient request due to work conflict',
    maxLength: 255,
  })
  @Column({
    type: 'varchar',
    length: 255,
    name: 'modification_reason',
    nullable: true,
    comment: 'Reason provided for modifying or rescheduling the appointment',
  })
  modificationReason?: string;

  @ApiProperty({
    description: 'Identifier of the assigned doctor (FK)',
    example: 12,
    type: Number,
  })
  @Column({
    type: 'integer',
    name: 'doctor_id',
    comment: 'Identifier of the assigned doctor (FK)',
  })
  @Index('idx_appointment_doctor_id')
  doctorId: number;

  @ApiPropertyOptional({
    type: () => Doctor,
    description: 'Doctor entity associated with this appointment',
  })
  @ManyToOne(() => Doctor, (doctor) => doctor.appointments, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'doctor_id' })
  doctor: Relation<Doctor>;

  @ApiProperty({
    description: 'Identifier of the assigned patient (FK)',
    example: 450,
    type: Number,
  })
  @Column({
    type: 'integer',
    name: 'patient_id',
    comment: 'Identifier of the assigned patient (FK)',
  })
  @Index('idx_appointment_patient_id')
  patientId: number;

  @ApiPropertyOptional({
    type: () => Patient,
    description: 'Patient entity associated with this appointment',
  })
  @ManyToOne(() => Patient, (patient) => patient.appointments, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'patient_id' })
  patient: Relation<Patient>;

  @ApiProperty({
    description: 'Indicates whether the visit was spontaneous (walk-in)',
    example: false,
    default: false,
    type: Boolean,
  })
  @Column({
    type: 'boolean',
    name: 'is_walk_in',
    default: false,
    comment: 'Flags whether the patient arrived without a prior booking',
  })
  isWalkIn: boolean;
}
