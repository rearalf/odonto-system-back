import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/database/base.entity.js';
import { DayOfWeek } from '../../../common/enums/day-of-week.enum.js';
import { Doctor } from './doctor.entity.js';

@Entity('doctor_availability')
export class DoctorAvailability extends BaseEntity {
  @ApiProperty({
    description: 'Doctor this schedule block belongs to',
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
    description: 'Start of the attention block (HH:MM:SS)',
    example: '08:00:00',
  })
  @Column({
    name: 'start_time',
    type: 'time',
    nullable: false,
    comment: 'Start time of the attention block',
  })
  startTime: string;

  @ApiProperty({
    description: 'End of the attention block (HH:MM:SS)',
    example: '13:00:00',
  })
  @Column({
    name: 'end_time',
    type: 'time',
    nullable: false,
    comment: 'End time of the attention block',
  })
  endTime: string;

  @ApiProperty({
    description: 'Length in minutes of each bookable slot',
    example: 30,
    default: 30,
  })
  @Column({
    name: 'slot_duration',
    type: 'int',
    nullable: false,
    default: 30,
    comment: 'Duration in minutes of each appointment slot',
  })
  slotDuration: number;

  @ApiProperty({
    description:
      'Indicates whether the block repeats every week (using day_of_week) or applies only to a specific date',
    example: true,
    default: true,
  })
  @Column({
    name: 'is_recurring',
    type: 'boolean',
    nullable: false,
    default: true,
    comment: 'Flag indicating whether the block repeats weekly',
  })
  isRecurring: boolean;

  @ApiPropertyOptional({
    description:
      'Day of the week this block applies to (0 = Sunday ... 6 = Saturday). Required when is_recurring is true',
    enum: DayOfWeek,
    example: DayOfWeek.MONDAY,
    nullable: true,
  })
  @Column({
    name: 'day_of_week',
    type: 'int',
    nullable: true,
    comment: 'Day of the week the block applies to (0 = Sunday)',
  })
  dayOfWeek: DayOfWeek | null;

  @ApiPropertyOptional({
    description:
      'Exact date this block applies to (YYYY-MM-DD). Required when is_recurring is false',
    example: '2026-10-15',
    nullable: true,
  })
  @Column({
    name: 'specific_date',
    type: 'date',
    nullable: true,
    comment: 'Exact date the block applies to',
  })
  specificDate: string | null;
}
