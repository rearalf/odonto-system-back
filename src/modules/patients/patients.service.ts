import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { Patient } from './entities/patient.entity.js';
import { PersonsService } from '../persons/persons.service.js';
import { CreatePatientDto } from './dto/create-patient.dto.js';
import { UpdatePatientDto } from './dto/update-patient.dto.js';
import { PERSON_TYPE_ID } from '../../common/enums/person-type.enum.js';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
    private readonly personsService: PersonsService,
    private readonly dataSource: DataSource,
  ) {}

  findAll(): Promise<Patient[]> {
    return this.patientRepository.find({
      relations: ['person', 'person.personType'],
    });
  }

  async findOne(id: number): Promise<Patient> {
    const patient = await this.patientRepository.findOne({
      where: { id },
      relations: ['person', 'person.personType'],
    });
    if (!patient) {
      throw new NotFoundException(`Patient with id ${id} not found`);
    }
    return patient;
  }

  async create(
    dto: CreatePatientDto,
    _profilePicture?: Express.Multer.File,
  ): Promise<Patient> {
    const {
      firstName,
      middleName,
      lastName,
      userId,
      phone,
      address,
      occupation,
      ...patientData
    } = dto;

    return this.dataSource.transaction(async (manager) => {
      const person = await this.personsService.createWithManager(manager, {
        firstName,
        middleName,
        lastName,
        userId,
        personTypeId: PERSON_TYPE_ID.PATIENT,
        phone,
        address,
        occupation,
      });

      const patient = manager.create(Patient, {
        ...patientData,
        personId: person.id,
      });
      return manager.save(patient);
    });
  }

  async update(id: number, dto: UpdatePatientDto): Promise<Patient> {
    await this.findOne(id);
    await this.patientRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.patientRepository.softDelete(id);
  }
}
