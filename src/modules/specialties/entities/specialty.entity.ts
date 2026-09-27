import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../../common/database/base.entity.js';

@Entity('specialty')
export class Specialty extends BaseEntity {
  @ApiProperty({
    description: 'Unique name of the dental specialty',
    example: 'Endodoncia',
    maxLength: 255,
  })
  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
    comment: 'Identifying name of the dental specialty',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Detailed description of what the specialty covers',
    example:
      'Se especializa en los tratamientos del conducto radicular, es decir, la extracción o tratamiento de los nervios infectados de los dientes.',
    maxLength: 255,
    nullable: true,
  })
  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: 'Detailed description of the dental specialty',
  })
  description: string | null;
}
