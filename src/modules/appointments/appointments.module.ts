import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment } from './entities/appointment.entity.js';
import { AppointmentStatus } from './entities/appointment-status.entity.js';
import { AppointmentsController } from './appointments.controller.js';
import { Doctor } from '../doctors/entities/doctor.entity.js';
import { Patient } from '../patients/entities/patient.entity.js';
import { Person } from '../persons/entities/person.entity.js';
import { AppointmentsService } from './appointments.service.js';
import { PersonsService } from '../persons/persons.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Appointment,
      AppointmentStatus,
      Doctor,
      Patient,
      Person,
    ]),
  ],
  controllers: [AppointmentsController],
  providers: [AppointmentsService, PersonsService],
})
export class AppointmentsModule {}
