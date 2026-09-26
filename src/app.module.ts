import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { validate } from './config/env.validation.js';
import { databaseConfig } from './config/database.config.js';
import { PersonTypesModule } from './modules/person-types/person-types.module.js';
import { PersonsModule } from './modules/persons/persons.module.js';
import { PatientsModule } from './modules/patients/patients.module.js';

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
      }),
    }),
    PersonTypesModule,
    PersonsModule,
    PatientsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
