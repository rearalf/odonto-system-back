import { Injectable, NotFoundException } from '@nestjs/common';
import { Brackets, DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { Patient } from './entities/patient.entity.js';
import { Person } from '../persons/entities/person.entity.js';

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

  private async findPatientEntity(id: number): Promise<Patient> {
    const patient = await this.patientRepository.findOne({
      where: { id },
      relations: ['person', 'person.personType'],
    });
    if (!patient) {
      throw new NotFoundException(`Patient with id ${id} not found`);
    }
    return patient;
  }

  async findOne(id: number) {
    const patient = await this.patientRepository
      .createQueryBuilder('patient')
      .leftJoinAndSelect('patient.person', 'person')
      .leftJoinAndSelect('person.personType', 'personType')
      .select([
        'patient.id',
        'patient.birthDate',
        'patient.gender',
        'patient.medicalHistory',
        'patient.allergicReactions',
        'patient.currentSystemicTreatment',
        'patient.labResults',
        'patient.completeOdontogram',
        'patient.hasSncIssues',
        'patient.hasSvcIssues',
        'patient.hasSeIssues',
        'patient.hasSmeIssues',
        'patient.hasSrIssues',
        'patient.hasSuIssues',
        'patient.hasSguIssues',
        'patient.hasSgiIssues',
        'patient.systemEvaluationNotes',
        'person.id',
        'person.firstName',
        'person.middleName',
        'person.lastName',
        'person.profilePictureUrl',
        'person.phone',
        'person.address',
        'person.occupation',
        'personType.id',
        'personType.name',
      ])
      .where('patient.id = :id', { id })
      .getOne();

    if (!patient) {
      throw new NotFoundException(`Patient with id ${id} not found`);
    }

    const {
      hasSncIssues,
      hasSvcIssues,
      hasSeIssues,
      hasSmeIssues,
      hasSrIssues,
      hasSuIssues,
      hasSguIssues,
      hasSgiIssues,
      systemEvaluationNotes,
      ...rest
    } = patient;

    return {
      ...rest,
      systemicReview: {
        hasSncIssues,
        hasSvcIssues,
        hasSeIssues,
        hasSmeIssues,
        hasSrIssues,
        hasSuIssues,
        hasSguIssues,
        hasSgiIssues,
        systemEvaluationNotes,
      },
    };
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

  async update(
    id: number,
    dto: UpdatePatientDto,
    _profilePicture?: Express.Multer.File,
  ) {
    const patient = await this.findPatientEntity(id);

    const {
      firstName,
      middleName,
      lastName,
      userId,
      phone,
      address,
      occupation,
      systemEvaluationNotes,
      ...patientData
    } = dto;

    const hasPersonFields =
      firstName !== undefined ||
      middleName !== undefined ||
      lastName !== undefined ||
      userId !== undefined ||
      phone !== undefined ||
      address !== undefined ||
      occupation !== undefined;

    return this.dataSource.transaction(async (manager) => {
      if (hasPersonFields) {
        const personUpdate: Record<string, unknown> = {};
        if (firstName !== undefined) personUpdate.firstName = firstName;
        if (middleName !== undefined) personUpdate.middleName = middleName;
        if (lastName !== undefined) personUpdate.lastName = lastName;
        if (userId !== undefined) personUpdate.userId = userId;
        if (phone !== undefined) personUpdate.phone = phone;
        if (address !== undefined) personUpdate.address = address;
        if (occupation !== undefined) personUpdate.occupation = occupation;

        await manager.update(Person, patient.personId, personUpdate);
      }

      const patientUpdate: Record<string, unknown> = {};
      if (patientData.birthDate !== undefined)
        patientUpdate.birthDate = patientData.birthDate;
      if (patientData.gender !== undefined)
        patientUpdate.gender = patientData.gender;
      if (patientData.medicalHistory !== undefined)
        patientUpdate.medicalHistory = patientData.medicalHistory;
      if (patientData.allergicReactions !== undefined)
        patientUpdate.allergicReactions = patientData.allergicReactions;
      if (patientData.currentSystemicTreatment !== undefined)
        patientUpdate.currentSystemicTreatment =
          patientData.currentSystemicTreatment;
      if (patientData.labResults !== undefined)
        patientUpdate.labResults = patientData.labResults;
      if (patientData.completeOdontogram !== undefined)
        patientUpdate.completeOdontogram = patientData.completeOdontogram;
      if (patientData.hasSncIssues !== undefined)
        patientUpdate.hasSncIssues = patientData.hasSncIssues;
      if (patientData.hasSvcIssues !== undefined)
        patientUpdate.hasSvcIssues = patientData.hasSvcIssues;
      if (patientData.hasSeIssues !== undefined)
        patientUpdate.hasSeIssues = patientData.hasSeIssues;
      if (patientData.hasSmeIssues !== undefined)
        patientUpdate.hasSmeIssues = patientData.hasSmeIssues;
      if (patientData.hasSrIssues !== undefined)
        patientUpdate.hasSrIssues = patientData.hasSrIssues;
      if (patientData.hasSuIssues !== undefined)
        patientUpdate.hasSuIssues = patientData.hasSuIssues;
      if (patientData.hasSguIssues !== undefined)
        patientUpdate.hasSguIssues = patientData.hasSguIssues;
      if (patientData.hasSgiIssues !== undefined)
        patientUpdate.hasSgiIssues = patientData.hasSgiIssues;

      if (Object.keys(patientUpdate).length > 0) {
        await manager.update(Patient, id, patientUpdate);
      }

      return this.findOne(id);
    });
  }

  async remove(id: number): Promise<void> {
    const patient = await this.findPatientEntity(id);
    await this.dataSource.transaction(async (manager) => {
      await manager.softDelete(Patient, id);
      await manager.softDelete(Person, patient.personId);
    });
  }
}
