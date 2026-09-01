import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
    let personId = dto.personId;

    if (personId) {
      await this.personsService.findOne(personId);
    } else if (dto.person) {
      const person = await this.personsService.create(dto.person);
      personId = person.id;
    } else {
      throw new BadRequestException(
        'Either personId or person data must be provided',
      );
    }

    const patient = this.patientRepository.create({
      ...dto,
      personId,
    });
    return this.patientRepository.save(patient);
  }

  async update(id: number, dto: UpdatePatientDto): Promise<Patient> {
    await this.findOne(id);

    if (dto.personId) {
      await this.personsService.findOne(dto.personId);
    }

    await this.patientRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.patientRepository.softDelete(id);
  }
}
