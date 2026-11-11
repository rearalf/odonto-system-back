import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment } from './entities/appointment.entity.js';
import { AppointmentStatus } from './entities/appointment-status.entity.js';
import { AppointmentsController } from './controllers/appointments.controller.js';
import { Doctor } from '../doctors/entities/doctor.entity.js';
import { Patient } from '../patients/entities/patient.entity.js';
import { Person } from '../persons/entities/person.entity.js';
import { AppointmentsService } from './services/appointments.service.js';
import { PersonsService } from '../persons/persons.service.js';
import { StatusesController } from './controllers/statuses.controller.js';
import { StatusesService } from './services/statuses.service.js';

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
  controllers: [AppointmentsController, StatusesController],
  providers: [AppointmentsService, StatusesService, PersonsService],
})
export class AppointmentsModule {}
