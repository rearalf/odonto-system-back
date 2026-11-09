import { ApiProperty } from '@nestjs/swagger';

class SpecialtyDto {
  @ApiProperty()
  isPrimary: boolean;
  @ApiProperty()
  id: number;
  @ApiProperty()
  name: string;
  @ApiProperty()
  description: string | null;
}

class DoctorDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  fullName: string;
  @ApiProperty()
  firstName: string;
  @ApiProperty({ required: false })
  middleName: string | null;
  @ApiProperty()
  lastName: string;
  @ApiProperty({ required: false })
  profilePictureUrl: string | null;
  @ApiProperty({ required: false })
  phone: string | null;
  @ApiProperty({ type: () => [SpecialtyDto] })
  specialties: SpecialtyDto[];
}

class PatientDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  fullName: string;
  @ApiProperty()
  firstName: string;
  @ApiProperty({ required: false })
  middleName: string | null;
  @ApiProperty()
  lastName: string;
  @ApiProperty({ required: false })
  profilePictureUrl: string | null;
  @ApiProperty({ required: false })
  phone: string | null;
  @ApiProperty()
  birthDate: Date;
  @ApiProperty()
  gender: string;
  @ApiProperty()
  completeOdontogram: boolean;
}

class AppointmentStatusDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  name: string;
  @ApiProperty()
  color: string;
  @ApiProperty({ required: false })
  description?: string | null;
}

export class AppointmentDetailResponseDto {
  @ApiProperty()
  id: number;
  @ApiProperty({ required: false, nullable: true })
  reason?: string | null;
  @ApiProperty({ required: false, nullable: true })
  notes?: string | null;
  @ApiProperty()
  startTime: Date;
  @ApiProperty()
  endTime: Date;
  @ApiProperty({ required: false, nullable: true })
  modifiedAt?: Date | null;
  @ApiProperty({ required: false, nullable: true })
  modificationReason?: string | null;
  @ApiProperty()
  isWalkIn: boolean;
  @ApiProperty({ type: () => AppointmentStatusDto })
  status: AppointmentStatusDto;
  @ApiProperty({ type: () => DoctorDto })
  doctor: DoctorDto;
  @ApiProperty({ type: () => PatientDto })
  patient: PatientDto;
}
