import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  EntityManager,
  QueryDeepPartialEntity,
  Repository,
} from 'typeorm';

import { DoctorSpecialty } from '../entities/doctor-specialty.entity.js';
import { Doctor } from '../entities/doctor.entity.js';
import { Specialty } from '../../specialties/entities/specialty.entity.js';

import { CreateDoctorSpecialtyDto } from '../dto/create-doctor-specialty.dto.js';
import { FilterDoctorSpecialtyDto } from '../dto/filter-doctor-specialty.dto.js';
import { UpdateDoctorSpecialtyDto } from '../dto/update-doctor-specialty.dto.js';

import {
  PaginationHelper,
  PaginationMeta,
} from '../../../common/helpers/pagination-helper.js';
import { unaccent } from '../../../common/utils/unaccent.js';

@Injectable()
export class DoctorSpecialtiesService {
  constructor(
    @InjectRepository(DoctorSpecialty)
    private readonly doctorSpecialtyRepository: Repository<DoctorSpecialty>,
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
    @InjectRepository(Specialty)
    private readonly specialtyRepository: Repository<Specialty>,
    private readonly dataSource: DataSource,
  ) {}

  async findSpecialties(
    doctorId: number,
    filterDoctorSpecialtyDto: FilterDoctorSpecialtyDto,
  ): Promise<{
    data: DoctorSpecialty[];
    meta: PaginationMeta | null;
  }> {
    await this.assertDoctorExists(doctorId);

    const selectQuery = this.doctorSpecialtyRepository
      .createQueryBuilder('doctorSpecialty')
      .leftJoinAndSelect('doctorSpecialty.specialty', 'specialty')
      .where('doctorSpecialty.doctorId = :doctorId', { doctorId });

    if (filterDoctorSpecialtyDto.search?.trim()) {
      selectQuery.andWhere('unaccent(specialty.name) ILIKE :search', {
        search: `%${unaccent(filterDoctorSpecialtyDto.search.trim())}%`,
      });
    }

    if (filterDoctorSpecialtyDto.pagination) {
      PaginationHelper.paginate(
        selectQuery,
        filterDoctorSpecialtyDto.page,
        filterDoctorSpecialtyDto.per_page,
      );
    }

    const [data, total] = await selectQuery
      .orderBy('doctorSpecialty.isPrimary', 'DESC')
      .addOrderBy('specialty.name', 'ASC')
      .getManyAndCount();

    return {
      data,
      meta: PaginationHelper.buildMeta(total, filterDoctorSpecialtyDto),
    };
  }

  async addSpecialty(
    doctorId: number,
    dto: CreateDoctorSpecialtyDto,
  ): Promise<DoctorSpecialty> {
    await this.assertDoctorExists(doctorId);

    return this.dataSource.transaction(async (manager) => {
      await this.assertSpecialtyIsUsable(doctorId, dto.specialtyId, manager);

      if (dto.isPrimary) {
        await this.demoteOtherPrimaries(doctorId, manager);
      }

      const saved = await manager.save(
        manager.create(DoctorSpecialty, {
          doctorId,
          specialtyId: dto.specialtyId,
          isPrimary: dto.isPrimary ?? false,
        }),
      );

      const specialty = await manager.findOneByOrFail(Specialty, {
        id: saved.specialtyId,
      });

      return { ...saved, specialty };
    });
  }

  async updateSpecialty(
    doctorId: number,
    id: number,
    dto: UpdateDoctorSpecialtyDto,
  ): Promise<DoctorSpecialty> {
    const current = await this.findSpecialtyRow(doctorId, id);

    if (dto.specialtyId !== undefined) {
      await this.assertSpecialtyIsUsable(
        doctorId,
        dto.specialtyId,
        undefined,
        current.id,
      );
    }

    if (dto.isPrimary) {
      await this.demoteOtherPrimaries(doctorId, this.dataSource.manager, id);
    }

    const update: QueryDeepPartialEntity<DoctorSpecialty> = {};
    if (dto.specialtyId !== undefined) update.specialtyId = dto.specialtyId;
    if (dto.isPrimary !== undefined) update.isPrimary = dto.isPrimary;

    if (Object.keys(update).length > 0) {
      await this.doctorSpecialtyRepository.update(current.id, update);
    }

    return this.doctorSpecialtyRepository.findOneOrFail({
      where: { id: current.id },
      relations: { specialty: true },
    });
  }

  async removeSpecialty(doctorId: number, id: number): Promise<void> {
    const current = await this.findSpecialtyRow(doctorId, id);
    await this.doctorSpecialtyRepository.softDelete(current.id);
  }

  // llamado por DoctorsService.create dentro de su transacción
  async createMany(
    doctorId: number,
    items: CreateDoctorSpecialtyDto[],
    manager: EntityManager,
  ): Promise<void> {
    const seen = new Set<number>();
    for (const item of items) {
      if (seen.has(item.specialtyId)) {
        throw new BadRequestException(
          `La especialidad ${item.specialtyId} viene repetida en la misma lista.`,
        );
      }
      seen.add(item.specialtyId);
      await this.assertSpecialtyIsUsable(doctorId, item.specialtyId, manager);
    }

    // ponytail: si el lote trae varias is_primary, gana la última
    const primaryIndex = items.findLastIndex((item) => item.isPrimary === true);
    if (primaryIndex !== -1) {
      await this.demoteOtherPrimaries(doctorId, manager);
    }

    await manager.save(
      DoctorSpecialty,
      items.map((item, index) =>
        manager.create(DoctorSpecialty, {
          doctorId,
          specialtyId: item.specialtyId,
          isPrimary: index === primaryIndex,
        }),
      ),
    );
  }

  private async assertDoctorExists(doctorId: number): Promise<void> {
    const exists = await this.doctorRepository.exist({
      where: { id: doctorId },
    });

    if (!exists) {
      throw new NotFoundException(`Doctor with id ${doctorId} not found`);
    }
  }

  private async assertSpecialtyIsUsable(
    doctorId: number,
    specialtyId: number,
    manager?: EntityManager,
    excludeId?: number,
  ): Promise<void> {
    const executor = manager ?? this.dataSource.manager;

    const specialty = await executor.findOne(Specialty, {
      where: { id: specialtyId },
    });
    if (!specialty) {
      throw new NotFoundException(`Specialty with id ${specialtyId} not found`);
    }

    const existing = await executor.findOne(DoctorSpecialty, {
      where: { doctorId, specialtyId },
    });
    if (existing && existing.id !== excludeId) {
      throw new ConflictException(
        `La especialidad ${specialtyId} ya está registrada para este doctor.`,
      );
    }
  }

  private async demoteOtherPrimaries(
    doctorId: number,
    manager: EntityManager,
    excludeId?: number,
  ): Promise<void> {
    const query = manager
      .createQueryBuilder()
      .update(DoctorSpecialty)
      .set({ isPrimary: false })
      .where('doctor_id = :doctorId', { doctorId });

    if (excludeId !== undefined) {
      query.andWhere('id != :excludeId', { excludeId });
    }

    await query.execute();
  }

  private async findSpecialtyRow(
    doctorId: number,
    id: number,
  ): Promise<DoctorSpecialty> {
    const row = await this.doctorSpecialtyRepository.findOne({
      where: { id, doctorId },
    });

    if (!row) {
      throw new NotFoundException(
        `Specialty ${id} is not registered for doctor ${doctorId}`,
      );
    }

    return row;
  }
}
