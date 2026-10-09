import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';

import { BaseEntity } from '../../../common/database/base.entity.js';
import { Person } from '../../persons/entities/person.entity.js';
import { DoctorSpecialty } from './doctor-specialty.entity.js';
import { DoctorAvailability } from './doctor-availability.entity.js';
import { DoctorUnavailability } from './doctor-unavailability.entity.js';

@Entity('doctor')
export class Doctor extends BaseEntity {
  @ApiProperty({
    description: 'Personal details of the doctor',
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
    description:
      'Unique foreign key referencing the person acting as this doctor',
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

  @ApiPropertyOptional({
    description: 'Academic degree or professional title of the doctor',
    example: 'Doctor en Odontología, MSc en Implantología',
    maxLength: 255,
    nullable: true,
  })
  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: 'Academic qualification or professional title of the doctor',
  })
  qualification: string | null;

  @OneToMany(() => DoctorSpecialty, (ds) => ds.doctor)
  doctorSpecialtys: DoctorSpecialty[];

  @ApiProperty({
    description:
      'Weekly or date-specific availability blocks defined for this doctor',
    type: () => [DoctorAvailability],
  })
  @OneToMany(() => DoctorAvailability, (availability) => availability.doctor)
  availabilities: DoctorAvailability[];

  @ApiProperty({
    description: 'Time blocks during which this doctor is unavailable',
    type: () => [DoctorUnavailability],
  })
  @OneToMany(
    () => DoctorUnavailability,
    (unavailability) => unavailability.doctor,
  )
  unavailabilities: DoctorUnavailability[];
}
