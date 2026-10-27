import { PartialType } from '@nestjs/swagger';
import { CreateDoctorUnavailabilityDto } from './create-doctor-unavailability.dto.js';

export class UpdateDoctorUnavailabilityDto extends PartialType(
  CreateDoctorUnavailabilityDto,
) {}
