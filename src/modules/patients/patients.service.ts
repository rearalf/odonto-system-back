import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from './entities/patient.entity.js';
import { PersonsService } from '../persons/persons.service.js';
import { CreatePatientDto } from './dto/create-patient.dto.js';
import { UpdatePatientDto } from './dto/update-patient.dto.js';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
    private readonly personsService: PersonsService,
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

  async create(dto: CreatePatientDto): Promise<Patient> {
    const {
      firstName,
      middleName,
      lastName,
      profilePictureName,
      profilePictureUrl,
      userId,
      personTypeId,
      phone,
      address,
      occupation,
      ...patientData
    } = dto;

    const person = await this.personsService.create({
      firstName,
      middleName,
      lastName,
      profilePictureName,
      profilePictureUrl,
      userId,
      personTypeId,
      phone,
      address,
      occupation,
    });

    const patient = this.patientRepository.create({
      ...patientData,
      personId: person.id,
    });
    return this.patientRepository.save(patient);
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
