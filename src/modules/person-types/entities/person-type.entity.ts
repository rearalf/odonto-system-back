import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../../common/database/base.entity.js';

@Entity('person_type')
export class PersonType extends BaseEntity {
  @ApiProperty({
    description:
      'Unique name of the person type (e.g., natural person, legal entity)',
    example: 'Natural Person',
    maxLength: 255,
  })
  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
    comment: 'Identifying name of the person type',
  })
  name: string;

  @ApiPropertyOptional({
    description:
      'Detailed description or additional notes about the person type',
    example: 'An individual human being who possesses legal rights and duties.',
    maxLength: 255,
    nullable: true,
  })
  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: 'Detailed description of the person type',
  })
  description: string | null;
}
