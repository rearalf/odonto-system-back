import { ApiProperty } from '@nestjs/swagger';

export class DoctorListItem {
  @ApiProperty({ description: 'Unique doctor identifier', example: 1 })
  id: number;

  @ApiProperty({
    description: 'Full name of the doctor',
    example: 'Juan Carlos Pérez Martínez',
  })
  fullName: string;

  @ApiProperty({
    description: 'Academic qualification or professional title',
    example: 'Doctor en Odontología, MSc en Implantología',
    nullable: true,
  })
  qualification: string | null;

  @ApiProperty({
    description: 'Total specialties attached to this doctor',
    example: 3,
  })
  specialtyCount: number;

  @ApiProperty({
    description: 'Name of the primary specialty, if any',
    example: 'Ortodoncia',
    nullable: true,
  })
  primarySpecialty: string | null;

  @ApiProperty({
    description: 'Profile picture URL or file path',
    example: '/uploads/avatars/doctor-1.jpg',
    nullable: true,
  })
  avatarUrl: string | null;

  @ApiProperty({
    description: 'Contact phone number (8 digits)',
    example: '71234567',
    nullable: true,
  })
  phone: string | null;
}
