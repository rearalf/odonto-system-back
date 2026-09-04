import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/database/base.entity.js';
import { PersonType } from '../../person-types/entities/person-type.entity.js';

@Entity('person')
export class Person extends BaseEntity {
  @ApiProperty({
    description: "Person's first name",
    example: 'John',
    maxLength: 255,
  })
  @Column({
    type: 'varchar',
    length: 255,
    comment: "Person's first name",
  })
  firstName: string;

  @ApiPropertyOptional({
    description: "Person's middle name (if applicable)",
    example: 'Edward',
    maxLength: 255,
    nullable: true,
  })
  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: "Person's middle name",
  })
  middleName: string | null;

  @ApiProperty({
    description: "Person's last name or surnames",
    example: 'Doe Smith',
    maxLength: 255,
  })
  @Column({
    type: 'varchar',
    length: 255,
    comment: "Person's last name",
  })
  lastName: string;

  @ApiPropertyOptional({
    description: 'Storage file name or key for the profile picture',
    example: 'avatar-john-doe-123.jpg',
    maxLength: 255,
    nullable: true,
  })
  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: 'File name of the profile picture',
  })
  profilePictureName: string | null;

  @ApiPropertyOptional({
    description: 'Public or pre-signed URL to access the profile picture',
    example: 'https://cdn.example.com/profiles/avatar-john-doe-123.jpg',
    maxLength: 255,
    nullable: true,
  })
  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: 'Direct URL to the profile picture',
  })
  profilePictureUrl: string | null;

  @ApiPropertyOptional({
    description:
      'Associated user identifier in the authentication system (if applicable)',
    example: 42,
    nullable: true,
  })
  @Column({
    type: 'int',
    nullable: true,
    comment: 'Associated user ID in the auth/users table',
  })
  userId: number | null;

  @ApiProperty({
    description: 'Person type relationship associated with this record',
    type: () => PersonType,
  })
  @ManyToOne(() => PersonType, { nullable: false })
  @JoinColumn({ name: 'person_type_id' })
  personType: PersonType;

  @ApiProperty({
    description: 'Foreign key identifier referencing the person type',
    example: 1,
  })
  @Column({
    name: 'person_type_id',
    type: 'int',
    comment: 'Foreign key referencing person_type(id)',
  })
  personTypeId: number;

  @ApiPropertyOptional({
    description: 'Contact phone number (8 digits)',
    example: '71234567',
    maxLength: 8,
    nullable: true,
  })
  @Column({
    type: 'varchar',
    length: 8,
    nullable: true,
    comment: 'Contact phone number',
  })
  phone: string | null;

  @ApiPropertyOptional({
    description: 'Physical or residential address of the person',
    example: '123 Main Street, Suite 400',
    maxLength: 100,
    nullable: true,
  })
  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: 'Physical/residential address',
  })
  address: string | null;

  @ApiPropertyOptional({
    description: "Person's profession, job title, or occupation",
    example: 'Software Engineer',
    maxLength: 50,
    nullable: true,
  })
  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: 'Occupation or profession',
  })
  occupation: string | null;
}
