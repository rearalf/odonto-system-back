import { ApiProperty } from '@nestjs/swagger';

class SpecialtyDto {
  @ApiProperty() id: number;
  @ApiProperty() name: string;
}

class DoctorSpecialtyDto {
  @ApiProperty() id: number;
  @ApiProperty({ type: () => SpecialtyDto }) specialty: SpecialtyDto;
  @ApiProperty() isPrimary: boolean;
}

class PersonDto {
  @ApiProperty() firstName: string;
  @ApiProperty({ required: false }) middleName: string | null;
  @ApiProperty() lastName: string;
  @ApiProperty({ required: false }) profilePictureUrl: string | null;
  @ApiProperty({ required: false }) phone: string | null;
}

class DoctorDto {
  @ApiProperty() id: number;
  @ApiProperty({ type: () => PersonDto }) person: PersonDto;
  @ApiProperty({ type: () => [DoctorSpecialtyDto] })
  doctorSpecialtys: DoctorSpecialtyDto[];
}

class PatientDto {
  @ApiProperty() id: number;
  @ApiProperty({ type: () => PersonDto }) person: PersonDto;
  @ApiProperty() birthDate: Date;
  @ApiProperty() gender: string;
  @ApiProperty() completeOdontogram: boolean;
}

class AppointmentStatusDto {
  @ApiProperty() id: number;
  @ApiProperty() name: string;
  @ApiProperty() color: string;
  @ApiProperty() description?: string;
}

export class AppointmentDetailResponseDto {
  @ApiProperty() id: number;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
  @ApiProperty({ required: false }) deletedAt?: Date | null;
  @ApiProperty({ required: false }) reason?: string | null;
  @ApiProperty({ required: false }) notes?: string | null;
  @ApiProperty() statusId: number;
  @ApiProperty({ type: () => AppointmentStatusDto })
  status: AppointmentStatusDto;
  @ApiProperty() startTime: Date;
  @ApiProperty() endTime: Date;
  @ApiProperty({ required: false }) modifiedAt?: Date | null;
  @ApiProperty({ required: false }) modificationReason?: string | null;
  @ApiProperty() doctorId: number;
  @ApiProperty({ type: () => DoctorDto }) doctor: DoctorDto;
  @ApiProperty() patientId: number;
  @ApiProperty({ type: () => PatientDto }) patient: PatientDto;
  @ApiProperty() isWalkIn: boolean;
}
