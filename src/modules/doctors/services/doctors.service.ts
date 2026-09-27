import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Brackets,
  DataSource,
  EntityManager,
  QueryDeepPartialEntity,
  Repository,
} from 'typeorm';

import { DoctorAvailability } from '../entities/doctor-availability.entity.js';
import { DoctorSpecialty } from '../entities/doctor-specialty.entity.js';
import { DoctorUnavailability } from '../entities/doctor-unavailability.entity.js';
import { Doctor } from '../entities/doctor.entity.js';

import { Patient } from '../../patients/entities/patient.entity.js';
import { Person } from '../../persons/entities/person.entity.js';

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
    private readonly dataSource: DataSource,
  ) {}

  async findAll(
    filterDoctorDto: FilterDoctorDto,
  ): Promise<{ data: Doctor[]; meta: PaginationMeta | null }> {
    const selectQuery = this.doctorRepository
      .createQueryBuilder('doctor')
      .leftJoinAndSelect('doctor.person', 'person');

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

    const [data, total] = await selectQuery
      .orderBy('person.lastName', 'ASC')
      .addOrderBy('person.firstName', 'ASC')
      .getManyAndCount();

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

  async create(dto: CreateDoctorDto): Promise<DoctorDetail> {
    const doctor = await this.dataSource.transaction(async (manager) => {
      await this.assertPersonIsUsable(dto.personId, undefined, manager);

      const saved = await manager.save(
        manager.create(Doctor, {
          personId: dto.personId,
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

  async update(id: number, dto: UpdateDoctorDto): Promise<DoctorDetail> {
    await this.findOne(id);

    if (dto.personId !== undefined) {
      await this.assertPersonIsUsable(dto.personId, id);
    }

    const update: QueryDeepPartialEntity<Doctor> = {};
    if (dto.personId !== undefined) update.personId = dto.personId;
    if (dto.qualification !== undefined)
      update.qualification = dto.qualification;

    if (Object.keys(update).length > 0) {
      await this.doctorRepository.update(id, update);
    }

    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);

    await this.dataSource.transaction(async (manager) => {
      await manager.softDelete(DoctorSpecialty, { doctorId: id });
      await manager.softDelete(DoctorAvailability, { doctorId: id });
      await manager.softDelete(DoctorUnavailability, { doctorId: id });
      await manager.softDelete(Doctor, id);
    });
  }

  private async assertPersonIsUsable(
    personId: number,
    excludeDoctorId?: number,
    manager?: EntityManager,
  ): Promise<void> {
    const executor = manager ?? this.dataSource.manager;

    const person = await executor.findOne(Person, { where: { id: personId } });
    if (!person) {
      throw new NotFoundException(`Person with id ${personId} not found`);
    }

    if (person.personTypeId !== PERSON_TYPE_ID.DOCTOR) {
      throw new BadRequestException(
        `La persona ${personId} no está registrada como doctor, su person_type_id debe ser ${PERSON_TYPE_ID.DOCTOR}.`,
      );
    }

    const [doctor, patient] = await Promise.all([
      executor.findOne(Doctor, { where: { personId }, withDeleted: true }),
      executor.findOne(Patient, { where: { personId }, withDeleted: true }),
    ]);

    if (doctor && doctor.id !== excludeDoctorId) {
      throw new ConflictException(
        `La persona ${personId} ya está registrada como doctor.`,
      );
    }

    if (patient) {
      throw new ConflictException(
        `La persona ${personId} ya está registrada como paciente.`,
      );
    }
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
