import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/database/base.entity.js';
import { Doctor } from './doctor.entity.js';

@Entity('doctor_unavailability')
export class DoctorUnavailability extends BaseEntity {
  @ApiProperty({
    description: 'Doctor this unavailability block belongs to',
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
    description: 'Start of the unavailability interval (ISO 8601)',
    example: '2026-10-15T14:00:00.000Z',
  })
  @Column({
    name: 'start_time',
    type: 'timestamp',
    nullable: false,
    comment: 'Start instant of the unavailability block',
  })
  startTime: Date;

  @ApiProperty({
    description: 'End of the unavailability interval (ISO 8601)',
    example: '2026-10-15T18:00:00.000Z',
  })
  @Column({
    name: 'end_time',
    type: 'timestamp',
    nullable: false,
    comment: 'End instant of the unavailability block',
  })
  endTime: Date;

  @ApiPropertyOptional({
    description: 'Reason why the doctor is unavailable',
    example: 'Vacaciones',
    maxLength: 255,
    nullable: true,
  })
  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: 'Reason behind the unavailability',
  })
  reason: string | null;
}
