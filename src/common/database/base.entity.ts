import { ApiProperty } from '@nestjs/swagger';
import {
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export abstract class BaseEntity {
  @ApiProperty({
    description: 'Unique auto-incrementing identifier of the entity',
    example: 1,
  })
  @PrimaryGeneratedColumn({
    comment: 'Unique record identifier',
  })
  id: number;

  @ApiProperty({
    description: 'Timestamp when the record was created',
    example: '2026-09-01T14:30:00.000Z',
  })
  @CreateDateColumn({
    type: 'timestamp',
    comment: 'Creation timestamp',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Timestamp when the record was last updated',
    example: '2026-09-01T15:45:00.000Z',
  })
  @UpdateDateColumn({
    type: 'timestamp',
    comment: 'Last modification timestamp',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Timestamp of logical deletion (null if active)',
    example: null,
    nullable: true,
  })
  @DeleteDateColumn({
    type: 'timestamp',
    nullable: true,
    comment: 'Soft delete timestamp',
  })
  deletedAt: Date | null;
}
