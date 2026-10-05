import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Brackets,
  DataSource,
  QueryDeepPartialEntity,
  Repository,
} from 'typeorm';

import { DoctorAvailability } from '../entities/doctor-availability.entity.js';
import { DoctorSpecialty } from '../entities/doctor-specialty.entity.js';
import { DoctorUnavailability } from '../entities/doctor-unavailability.entity.js';
import { Doctor } from '../entities/doctor.entity.js';

import { Person } from '../../persons/entities/person.entity.js';
import { PersonsService } from '../../persons/persons.service.js';

import { CreateDoctorDto } from '../dto/create-doctor.dto.js';
import { FilterDoctorDto } from '../dto/filter-doctor.dto.js';
import { UpdateDoctorDto } from '../dto/update-doctor.dto.js';
import { DoctorSpecialtiesService } from './doctor-specialties.service.js';

import { PERSON_TYPE_ID } from '../../../common/enums/person-type.enum.js';
import {
  PaginationHelper,
  PaginationMeta,
} from '../../../common/helpers/pagination-helper.js';
import { unaccent } from '../../../common/utils/unaccent.js';
import { DoctorListItem } from '../dto/doctor-list-item.dto.js';

export interface DoctorDetail extends Doctor {
  specialties: DoctorSpecialty[];
}

@Injectable()
export class DoctorsService {
  constructor(
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
    @InjectRepository(DoctorSpecialty)
    private readonly doctorSpecialtyRepository: Repository<DoctorSpecialty>,
    private readonly doctorSpecialtiesService: DoctorSpecialtiesService,
    private readonly personsService: PersonsService,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(
    filterDoctorDto: FilterDoctorDto,
  ): Promise<{ data: DoctorListItem[]; meta: PaginationMeta | null }> {
    const selectQuery = this.doctorRepository
      .createQueryBuilder('doctor')
      .leftJoinAndSelect('doctor.person', 'person')
      .leftJoinAndSelect('doctor.doctorSpecialtys', 'doctorSpecialty')
      .leftJoinAndSelect('doctorSpecialty.specialty', 'specialty');

    if (filterDoctorDto.search?.trim()) {
      const search = `%${unaccent(filterDoctorDto.search.trim())}%`;
      selectQuery.andWhere(
        new Brackets((qb) => {
          qb.where('unaccent(person.firstName) ILIKE :search', { search })
            .orWhere('unaccent(person.middleName) ILIKE :search', { search })
            .orWhere('unaccent(person.lastName) ILIKE :search', { search });
        }),
      );
    }

    if (filterDoctorDto.pagination) {
      PaginationHelper.paginate(
        selectQuery,
        filterDoctorDto.page,
        filterDoctorDto.per_page,
      );
    }

    const [doctors, total] = await selectQuery
      .orderBy('person.lastName', 'ASC')
      .addOrderBy('person.firstName', 'ASC')
      .getManyAndCount();

    const data = doctors.map((doctor) => {
      const person = doctor.person;

      const fullName = [person.firstName, person.middleName, person.lastName]
        .filter(Boolean)
        .join(' ');

      const specialtyCount = doctor.doctorSpecialtys.filter(
        (ds) => !ds.isPrimary,
      );

      return {
        id: doctor.id,
        fullName,
        phone: person.phone || null,
        avatarUrl: person.profilePictureUrl,
        primarySpecialty:
          doctor.doctorSpecialtys.find((main) => main.isPrimary)?.specialty
            .name || null,
        specialtyCount: specialtyCount.length,
        qualification: doctor.qualification,
      };
    });

    return {
      data,
      meta: PaginationHelper.buildMeta(total, filterDoctorDto),
    };
  }

  async findOne(id: number): Promise<DoctorDetail> {
    const doctor = await this.doctorRepository.findOne({
      where: { id },
      relations: { person: { personType: true } },
    });

    if (!doctor) {
      throw new NotFoundException(`Doctor with id ${id} not found`);
    }

    return { ...doctor, specialties: await this.listSpecialtyRows(id) };
  }

  async create(
    dto: CreateDoctorDto,
    _profilePicture?: Express.Multer.File,
  ): Promise<DoctorDetail> {
    const { firstName, middleName, lastName, userId, phone } = dto;

    const doctor = await this.dataSource.transaction(async (manager) => {
      const person = await this.personsService.createWithManager(manager, {
        firstName,
        middleName,
        lastName,
        userId,
        phone,
        personTypeId: PERSON_TYPE_ID.DOCTOR,
      });

      const saved = await manager.save(
        manager.create(Doctor, {
          personId: person.id,
          qualification: dto.qualification ?? null,
        }),
      );

      if (dto.specialties?.length) {
        await this.doctorSpecialtiesService.createMany(
          saved.id,
          dto.specialties,
          manager,
        );
      }

      return saved;
    });

    return this.findOne(doctor.id);
  }

  async update(
    id: number,
    dto: UpdateDoctorDto,
    _profilePicture?: Express.Multer.File,
  ): Promise<DoctorDetail> {
    const { person } = await this.findOne(id);
    const { firstName, middleName, lastName, userId, phone } = dto;

    const personUpdate: QueryDeepPartialEntity<Person> = {};
    if (firstName !== undefined) personUpdate.firstName = firstName;
    if (middleName !== undefined) personUpdate.middleName = middleName;
    if (lastName !== undefined) personUpdate.lastName = lastName;
    if (userId !== undefined) personUpdate.userId = userId;
    if (phone !== undefined) personUpdate.phone = phone;

    const doctorUpdate: QueryDeepPartialEntity<Doctor> = {};
    if (dto.qualification !== undefined)
      doctorUpdate.qualification = dto.qualification;

    const hasPersonUpdate = Object.keys(personUpdate).length > 0;
    const hasDoctorUpdate = Object.keys(doctorUpdate).length > 0;

    if (hasPersonUpdate || hasDoctorUpdate) {
      await this.dataSource.transaction(async (manager) => {
        if (hasPersonUpdate) {
          await manager.update(Person, person.id, personUpdate);
        }
        if (hasDoctorUpdate) {
          await manager.update(Doctor, id, doctorUpdate);
        }
      });
    }

    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const { person } = await this.findOne(id);

    await this.dataSource.transaction(async (manager) => {
      await manager.softDelete(DoctorSpecialty, { doctorId: id });
      await manager.softDelete(DoctorAvailability, { doctorId: id });
      await manager.softDelete(DoctorUnavailability, { doctorId: id });
      await manager.softDelete(Doctor, id);
      await manager.softDelete(Person, person.id);
    });
  }

  private async listSpecialtyRows(
    doctorId: number,
  ): Promise<DoctorSpecialty[]> {
    return this.doctorSpecialtyRepository.find({
      where: { doctorId },
      relations: { specialty: true },
      order: { isPrimary: 'DESC', id: 'ASC' },
    });
  }
}
