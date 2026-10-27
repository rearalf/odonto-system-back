import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryDeepPartialEntity, Repository } from 'typeorm';

import { Specialty } from './entities/specialty.entity.js';
import { CreateSpecialtyDto } from './dto/create-specialty.dto.js';
import { UpdateSpecialtyDto } from './dto/update-specialty.dto.js';
import { FilterSpecialtyDto } from './dto/filter-specialty.dto.js';

import {
  PaginationHelper,
  PaginationMeta,
} from '../../common/helpers/pagination-helper.js';
import { unaccent } from '../../common/utils/unaccent.js';

@Injectable()
export class SpecialtiesService {
  constructor(
    @InjectRepository(Specialty)
    private readonly specialtyRepository: Repository<Specialty>,
  ) {}

  async findAll(
    filterSpecialtyDto: FilterSpecialtyDto,
  ): Promise<{ data: Specialty[]; meta: PaginationMeta | null }> {
    const selectQuery =
      this.specialtyRepository.createQueryBuilder('specialty');

    if (filterSpecialtyDto.search?.trim()) {
      selectQuery.andWhere('unaccent(specialty.name) ILIKE :search', {
        search: `%${unaccent(filterSpecialtyDto.search.trim())}%`,
      });
    }

    if (filterSpecialtyDto.pagination) {
      PaginationHelper.paginate(
        selectQuery,
        filterSpecialtyDto.page,
        filterSpecialtyDto.per_page,
      );
    }

    const [data, total] = await selectQuery
      .orderBy('specialty.name', 'ASC')
      .getManyAndCount();

    return {
      data,
      meta: PaginationHelper.buildMeta(total, filterSpecialtyDto),
    };
  }

  async findOne(id: number): Promise<Specialty> {
    const specialty = await this.specialtyRepository.findOneBy({ id });
    if (!specialty) {
      throw new NotFoundException(`Specialty with id ${id} not found`);
    }
    return specialty;
  }

  async create(dto: CreateSpecialtyDto): Promise<Specialty> {
    await this.assertNameAvailable(dto.name);

    const specialty = this.specialtyRepository.create({
      name: dto.name,
      description: dto.description ?? null,
    });

    return this.specialtyRepository.save(specialty);
  }

  async update(id: number, dto: UpdateSpecialtyDto): Promise<Specialty> {
    await this.findOne(id);

    if (dto.name !== undefined) {
      await this.assertNameAvailable(dto.name, id);
    }

    const update: QueryDeepPartialEntity<Specialty> = {};
    if (dto.name !== undefined) update.name = dto.name;
    if (dto.description !== undefined) update.description = dto.description;

    await this.specialtyRepository.update(id, update);

    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.specialtyRepository.softDelete(id);
  }

  private async assertNameAvailable(
    name: string,
    excludeId?: number,
  ): Promise<void> {
    const query = this.specialtyRepository
      .createQueryBuilder('specialty')
      .withDeleted()
      .where('unaccent(specialty.name) ILIKE unaccent(:name)', {
        name: name.trim(),
      });

    if (excludeId !== undefined) {
      query.andWhere('specialty.id != :excludeId', { excludeId });
    }

    const existing = await query.getOne();

    if (existing) {
      throw new ConflictException(
        `A specialty with the name "${name}" already exists`,
      );
    }
  }
}
