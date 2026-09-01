import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Patient } from './entities/patient.entity.js';
import { PatientsService } from './patients.service.js';
import { PatientsController } from './patients.controller.js';
import { PersonsModule } from '../persons/persons.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([Patient]), PersonsModule],
  controllers: [PatientsController],
  providers: [PatientsService],
})
export class PatientsModule {}
