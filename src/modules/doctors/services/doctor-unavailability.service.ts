import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';

import { DoctorUnavailability } from '../entities/doctor-unavailability.entity.js';
import { DoctorsService } from './doctors.service.js';

import { CreateDoctorUnavailabilityDto } from '../dto/create-doctor-unavailability.dto.js';
import { DoctorUnavailabilityResponseDto } from '../dto/doctor-unavailability-response.dto.js';
import { FilterDoctorUnavailabilityDto } from '../dto/filter-doctor-unavailability.dto.js';
import { UpdateDoctorUnavailabilityDto } from '../dto/update-doctor-unavailability.dto.js';

import {
  PaginationHelper,
  PaginationMeta,
} from '../../../common/helpers/pagination-helper.js';

interface UnavailabilityPayload {
  startTime: Date;
  endTime: Date;
  reason: string | null;
}

const UNAVAILABILITY_COLUMNS = [
  'unavailability.id',
  'unavailability.doctorId',
  'unavailability.startTime',
  'unavailability.endTime',
  'unavailability.reason',
];

@Injectable()
export class DoctorUnavailabilityService {
  constructor(
    @InjectRepository(DoctorUnavailability)
    private readonly doctorUnavailabilityRepository: Repository<DoctorUnavailability>,
    private readonly dataSource: DataSource,
    private readonly doctorsService: DoctorsService,
  ) {}

  async findUnavailability(
    doctorId: number,
    dto: FilterDoctorUnavailabilityDto,
  ): Promise<{
    data: DoctorUnavailabilityResponseDto[];
    meta: PaginationMeta | null;
  }> {
    await this.doctorsService.assertDoctorExists(doctorId);

    const query = this.doctorUnavailabilityRepository
      .createQueryBuilder('unavailability')
      .select(UNAVAILABILITY_COLUMNS)
      .where('unavailability.doctorId = :doctorId', { doctorId });

    if (dto.from) {
      query.andWhere('unavailability.endTime >= :from', {
        from: new Date(`${dto.from}T00:00:00.000Z`),
      });
    }

    if (dto.to) {
      query.andWhere('unavailability.startTime <= :to', {
        to: new Date(`${dto.to}T23:59:59.999Z`),
      });
    }

    if (dto.from && dto.to && dto.from > dto.to) {
      throw new BadRequestException(
        'El parámetro from no puede ser posterior a to.',
      );
    }

    const sort = dto.sort ?? 'startTime';
    const order = dto.order ?? 'ASC';
    query.addOrderBy(`unavailability.${sort}`, order);

    const { pagination, page = 1, per_page: perPage = 10 } = dto;
    let total = 0;

    if (pagination) {
      total = await query.getCount();
      PaginationHelper.paginate(query, page, perPage);
    }

    const data = await query.getMany();

    return {
      data,
      meta: pagination ? PaginationHelper.buildMeta(total, dto) : null,
    };
  }

  async addUnavailability(
    doctorId: number,
    dto: CreateDoctorUnavailabilityDto,
  ): Promise<DoctorUnavailabilityResponseDto> {
    await this.doctorsService.assertDoctorExists(doctorId);

    const payload = this.buildUnavailabilityPayload(dto);

    return this.dataSource.transaction(async (manager) => {
      await this.assertUnavailabilityIsFree(manager, doctorId, payload);

      // Cuando exista la entidad `appointment`, mover aquí dentro de la misma
      // transacción las citas activas (scheduled/confirmed) que choquen con el rango
      // [startTime, endTime] a estado `rescheduled` con modified_at = NOW() y
      // modification_reason = 'Ausencia médica registrada: ' + dto.reason.

      const saved = await manager.save(
        manager.create(DoctorUnavailability, { doctorId, ...payload }),
      );

      return manager
        .getRepository(DoctorUnavailability)
        .createQueryBuilder('unavailability')
        .select(UNAVAILABILITY_COLUMNS)
        .where('unavailability.id = :id', { id: saved.id })
        .getOneOrFail();
    });
  }

  async updateUnavailability(
    doctorId: number,
    id: number,
    dto: UpdateDoctorUnavailabilityDto,
  ): Promise<DoctorUnavailabilityResponseDto> {
    const current = await this.doctorUnavailabilityRepository
      .createQueryBuilder('unavailability')
      .where('unavailability.id = :id', { id })
      .andWhere('unavailability.doctorId = :doctorId', { doctorId })
      .getOne();

    if (!current) {
      throw new NotFoundException(
        'La indisponibilidad no está registrada para el médico.',
      );
    }

    return this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(DoctorUnavailability);

      const payload = this.buildUnavailabilityPayload(dto, current);
      await this.assertUnavailabilityIsFree(
        manager,
        doctorId,
        payload,
        current.id,
      );

      // Si el rango se expande, re-verificar aquí las citas afectadas
      // (como en addUnavailability) para pasarlas a rescheduled.

      await manager
        .createQueryBuilder()
        .update(DoctorUnavailability)
        .set(payload)
        .where('id = :id', { id })
        .execute();

      return repo
        .createQueryBuilder('unavailability')
        .select(UNAVAILABILITY_COLUMNS)
        .where('unavailability.id = :id', { id })
        .getOneOrFail();
    });
  }

  async removeUnavailability(
    doctorId: number,
    id: number,
  ): Promise<DoctorUnavailabilityResponseDto> {
    const removed = await this.doctorUnavailabilityRepository
      .createQueryBuilder('unavailability')
      .select(UNAVAILABILITY_COLUMNS)
      .where('unavailability.id = :id', { id })
      .andWhere('unavailability.doctorId = :doctorId', { doctorId })
      .getOne();

    if (!removed)
      throw new NotFoundException(
        'La indisponibilidad no está registrada para el médico.',
      );

    await this.dataSource.transaction(async (manager) => {
      await manager.softDelete(DoctorUnavailability, { id: removed.id });
    });

    return removed;
  }

  private buildUnavailabilityPayload(
    dto: CreateDoctorUnavailabilityDto | UpdateDoctorUnavailabilityDto,
    current?: DoctorUnavailability,
  ): UnavailabilityPayload {
    const rawStart = dto.startTime ?? current?.startTime;
    const rawEnd = dto.endTime ?? current?.endTime;

    if (!rawStart || !rawEnd) {
      throw new BadRequestException(
        'Las fechas de inicio y fin son obligatorias.',
      );
    }

    const startTime = new Date(rawStart);
    const endTime = new Date(rawEnd);

    if (endTime.getTime() <= startTime.getTime()) {
      throw new BadRequestException(
        'El fin de la indisponibilidad debe ser posterior al inicio.',
      );
    }

    return {
      startTime,
      endTime,
      reason: dto.reason ?? current?.reason ?? null,
    };
  }

  private async assertUnavailabilityIsFree(
    manager: EntityManager,
    doctorId: number,
    payload: UnavailabilityPayload,
    excludeId?: number,
  ): Promise<void> {
    const rows = await manager
      .getRepository(DoctorUnavailability)
      .createQueryBuilder('unavailability')
      .where('unavailability.doctorId = :doctorId', { doctorId })
      .getMany();

    const conflict = rows.some(
      (row) =>
        row.id !== excludeId &&
        row.startTime < payload.endTime &&
        row.endTime > payload.startTime,
    );

    if (conflict) {
      throw new ConflictException(
        'La indisponibilidad se solapa con otra ya registrada del mismo doctor.',
      );
    }
  }
}
