import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DoctorAvailabilityService } from './services/doctor-availability.service.js';
import { DoctorAvailabilityController } from './controllers/doctor-availability.controller.js';
import { DoctorAvailability } from './entities/doctor-availability.entity.js';
import { DoctorSpecialtiesService } from './services/doctor-specialties.service.js';
import { DoctorSpecialtiesController } from './controllers/doctor-specialties.controller.js';
import { DoctorSpecialty } from './entities/doctor-specialty.entity.js';
import { DoctorUnavailability } from './entities/doctor-unavailability.entity.js';
import { DoctorUnavailabilityController } from './controllers/doctor-unavailability.controller.js';
import { DoctorUnavailabilityService } from './services/doctor-unavailability.service.js';
import { Doctor } from './entities/doctor.entity.js';
import { DoctorsController } from './controllers/doctors.controller.js';
import { DoctorsService } from './services/doctors.service.js';
import { Patient } from '../patients/entities/patient.entity.js';
import { Person } from '../persons/entities/person.entity.js';
import { Specialty } from '../specialties/entities/specialty.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Doctor,
      DoctorSpecialty,
      DoctorAvailability,
      DoctorUnavailability,
      Person,
      Patient,
      Specialty,
    ]),
  ],
  controllers: [
    DoctorsController,
    DoctorSpecialtiesController,
    DoctorAvailabilityController,
    DoctorUnavailabilityController,
  ],
  providers: [
    DoctorsService,
    DoctorSpecialtiesService,
    DoctorAvailabilityService,
    DoctorUnavailabilityService,
  ],
  exports: [
    DoctorsService,
    DoctorSpecialtiesService,
    DoctorAvailabilityService,
    DoctorUnavailabilityService,
  ],
})
export class DoctorsModule {}
