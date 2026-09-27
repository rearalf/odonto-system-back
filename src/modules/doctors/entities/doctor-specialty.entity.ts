import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/database/base.entity.js';
import { Specialty } from '../../specialties/entities/specialty.entity.js';
import { Doctor } from './doctor.entity.js';

@Entity('doctor_specialty')
export class DoctorSpecialty extends BaseEntity {
  @ApiProperty({
    description: 'Doctor this specialty is attached to',
    type: () => Doctor,
  })
  @ManyToOne(() => Doctor, {
    nullable: false,
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn({ name: 'doctor_id' })
  doctor: Doctor;

  @ApiProperty({
    description: 'Foreign key referencing the doctor',
    example: 1,
  })
  @Column({
    name: 'doctor_id',
    type: 'int',
    nullable: false,
    comment: 'Foreign key referencing doctor(id)',
  })
  doctorId: number;

  @ApiProperty({
    description: 'Specialty the doctor practices',
    type: () => Specialty,
  })
  @ManyToOne(() => Specialty, {
    nullable: false,
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn({ name: 'specialty_id' })
  specialty: Specialty;

  @ApiProperty({
    description: 'Foreign key referencing the specialty',
    example: 3,
  })
  @Column({
    name: 'specialty_id',
    type: 'int',
    nullable: false,
    comment: 'Foreign key referencing specialty(id)',
  })
  specialtyId: number;

  @ApiProperty({
    description:
      'Indicates whether this is the main specialty of the doctor. Only one specialty per doctor can be primary',
    example: false,
    default: false,
  })
  @Column({
    name: 'is_primary',
    type: 'boolean',
    nullable: false,
    default: false,
    comment: 'Flag marking the main specialty of the doctor',
  })
  isPrimary: boolean;
}
