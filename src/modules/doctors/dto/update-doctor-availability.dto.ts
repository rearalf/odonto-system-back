import { PartialType } from '@nestjs/swagger';
import { CreateDoctorAvailabilityDto } from '../dto/create-doctor-availability.dto.js';

export class UpdateDoctorAvailabilityDto extends PartialType(
  CreateDoctorAvailabilityDto,
) {}
