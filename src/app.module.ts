import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';

import { databaseConfig } from './config/database.config.js';
import { validate } from './config/env.validation.js';

import { AppointmentsModule } from './modules/appointments/appointments.module.js';
import { PersonTypesModule } from './modules/person-types/person-types.module.js';
import { SpecialtiesModule } from './modules/specialties/specialties.module.js';
import { PatientsModule } from './modules/patients/patients.module.js';
import { DoctorsModule } from './modules/doctors/doctors.module.js';
import { PersonsModule } from './modules/persons/persons.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: () => ({
        ...databaseConfig(),
        autoLoadEntities: true,
        retryAttempts: 1,
        retryDelay: 1000,
      }),
    }),
    PatientsModule,
    DoctorsModule,
    SpecialtiesModule,
    AppointmentsModule,
    PersonTypesModule,
    PersonsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
