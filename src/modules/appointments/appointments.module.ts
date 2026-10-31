import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment } from './entities/appointment.entity.js';
import { AppointmentsController } from './appointments.controller.js';
import { Doctor } from '../doctors/entities/doctor.entity.js';
import { Patient } from '../patients/entities/patient.entity.js';
import { AppointmentsService } from './appointments.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Appointment, Doctor, Patient])],
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
})
export class AppointmentsModule {}
