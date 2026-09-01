import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersonType } from './entities/person-type.entity.js';
import { PersonTypesService } from './person-types.service.js';
import { PersonTypesController } from './person-types.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([PersonType])],
  controllers: [PersonTypesController],
  providers: [PersonTypesService],
  exports: [PersonTypesService],
})
export class PersonTypesModule {}
