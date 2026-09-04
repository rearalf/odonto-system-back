import { Injectable, NotFoundException } from '@nestjs/common';
import { Brackets, DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { Patient } from './entities/patient.entity.js';

import { PersonsService } from '../persons/persons.service.js';
import { CreatePatientDto } from './dto/create-patient.dto.js';
import { UpdatePatientDto } from './dto/update-patient.dto.js';
import { FilterPatientDto } from './dto/filter-patient.dto.js';

import { PERSON_TYPE_ID } from '../../common/enums/person-type.enum.js';
import { unaccent } from '../../common/utils/unaccent.js';
import {
  PaginationHelper,
  PaginationMeta,
} from '../../common/helpers/pagination-helper.js';
import { IPatientsAllFormatRow } from './interfaces/patient.interface.js';
import { calculateAge } from '../../common/utils/calculateAge.js';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
    private readonly personsService: PersonsService,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(
    filterPatientDto: FilterPatientDto,
  ): Promise<{ data: IPatientsAllFormatRow[]; meta: PaginationMeta | null }> {
    const selectQuery = this.patientRepository.createQueryBuilder('patient');

    if (filterPatientDto.search?.trim()) {
      const searchNormalized = unaccent(filterPatientDto.search.trim());
      selectQuery.andWhere(
        new Brackets((qb) => {
          qb.where('unaccent(person.firstName) ILIKE :filtro', {
            filtro: `%${searchNormalized}%`,
          })
            .orWhere('unaccent(person.middleName) ILIKE :filtro', {
              filtro: `%${searchNormalized}%`,
            })
            .orWhere('unaccent(person.lastName) ILIKE :filtro', {
              filtro: `%${searchNormalized}%`,
            });
        }),
      );
    }

    selectQuery.leftJoinAndSelect('patient.person', 'person');

    if (filterPatientDto.pagination) {
      PaginationHelper.paginate(
        selectQuery,
        filterPatientDto.page,
        filterPatientDto.per_page,
      );
    }

    const [patients, count] = await selectQuery.getManyAndCount();

    const meta = PaginationHelper.buildMeta(count, filterPatientDto);

    const data = patients.map((patient) => {
      const person = patient.person;

      const fullName = [person.firstName, person.middleName, person.lastName]
        .filter(Boolean)
        .join(' ');

      const hasSystemicRisk = Boolean(
        patient.hasSncIssues ||
        patient.hasSvcIssues ||
        patient.hasSeIssues ||
        patient.hasSmeIssues ||
        patient.hasSrIssues ||
        patient.hasSuIssues ||
        patient.hasSguIssues ||
        patient.hasSgiIssues,
      );

      return {
        id: patient.id,
        fullName,
        phone: person.phone || null,
        avatarUrl: person.profilePictureUrl,
        birthday: patient.birthDate,
        age: calculateAge(patient.birthDate),
        gender: patient.gender,
        hasAllergies: Boolean(patient.allergicReactions?.trim()),
        allergicReactions: patient.allergicReactions,
        medicalHistory: patient.medicalHistory,
        completeOdontogram: patient.completeOdontogram,
        hasSystemicRisk,
      };
    });

    return { data, meta };
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
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.patientRepository.softDelete(id);
  }
}
