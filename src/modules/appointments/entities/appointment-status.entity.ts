import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  type Relation,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Appointment } from '../../appointments/entities/appointment.entity.js';
import { BaseEntity } from '../../../common/database/base.entity.js';

@Entity('appointment_status')
export class AppointmentStatus extends BaseEntity {
  @ApiProperty({
    description: 'Unique key name for the status (used in code)',
    example: 'scheduled',
  })
  @Column({ type: 'varchar', length: 50, unique: true })
  name: string;

  @ApiProperty({
    description: 'Hex color or Tailwind color name for UI display',
    example: 'blue',
  })
  @Column({ type: 'varchar', length: 20 })
  color: string;

  @ApiProperty({
    description: 'Human-readable description',
    example: 'Cita programada',
    required: false,
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  description?: string;

  @ApiProperty({
    description: 'Whether this status is available for selection',
    example: true,
    default: true,
  })
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @ApiProperty({
    description: 'Display order in UI lists',
    example: 1,
    default: 0,
  })
  @Column({ type: 'integer', default: 0 })
  sortOrder: number;

  @OneToMany(() => Appointment, (appointment) => appointment.status)
  appointments: Relation<Appointment[]>;
}
