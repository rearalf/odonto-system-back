import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';

import { DoctorAvailability } from '../entities/doctor-availability.entity.js';
import { DoctorUnavailability } from '../entities/doctor-unavailability.entity.js';
import { DoctorsService } from './doctors.service.js';

import { AvailableSlotsDto } from '../dto/available-slots.dto.js';
import { BulkDoctorAvailabilityDto } from '../dto/bulk-doctor-availability.dto.js';
import { CreateDoctorAvailabilityDto } from '../dto/create-doctor-availability.dto.js';
import { QueryDoctorSlotsDto } from '../dto/query-doctor-slots.dto.js';
import { DoctorSlotResponseDto } from '../dto/slot-response.dto.js';
import { UpdateDoctorAvailabilityDto } from '../dto/update-doctor-availability.dto.js';

import { DayOfWeek } from '../../../common/enums/day-of-week.enum.js';

const DEFAULT_SLOT_DURATION = 30;

interface AvailabilityPayload {
  startTime: string;
  endTime: string;
  slotDuration: number;
  maxPatientsPerSlot: number;
  isRecurring: boolean;
  dayOfWeek: DayOfWeek | null;
  specificDate: string | null;
}

function toTimeString(value: string): string {
  const [hours, minutes, seconds = '00'] = value.split(':');
  return `${hours}:${minutes}:${seconds}`;
}

function toMinutes(time: string): number {
  const [hours, minutes] = time.split(':');
  return Number(hours) * 60 + Number(minutes);
}

function toClock(minutes: number): string {
  const hours = String(Math.floor(minutes / 60)).padStart(2, '0');
  return `${hours}:${String(minutes % 60).padStart(2, '0')}:00`;
}

@Injectable()
export class DoctorAvailabilityService {
  constructor(
    @InjectRepository(DoctorAvailability)
    private readonly doctorAvailabilityRepository: Repository<DoctorAvailability>,
    @InjectRepository(DoctorUnavailability)
    private readonly doctorUnavailabilityRepository: Repository<DoctorUnavailability>,
    private readonly dataSource: DataSource,
    private readonly doctorsService: DoctorsService,
  ) {}

  async findAvailability(
    doctorId: number,
    isRecurring?: boolean,
  ): Promise<DoctorAvailability[]> {
    await this.doctorsService.assertDoctorExists(doctorId);

    const query = this.doctorAvailabilityRepository
      .createQueryBuilder('availability')
      .where('availability.doctorId = :doctorId', { doctorId });

    if (isRecurring !== undefined) {
      query.andWhere('availability.isRecurring = :isRecurring', {
        isRecurring,
      });
    }

    return query
      .addOrderBy('availability.dayOfWeek', 'ASC')
      .addOrderBy('availability.specificDate', 'ASC')
      .addOrderBy('availability.startTime', 'ASC')
      .getMany();
  }

  async addAvailability(
    doctorId: number,
    dto: CreateDoctorAvailabilityDto,
  ): Promise<DoctorAvailability> {
    await this.doctorsService.assertDoctorExists(doctorId);

    const payload = this.buildAvailabilityPayload(dto);

    return this.dataSource.transaction(async (manager) => {
      await this.assertAvailabilityIsFree(manager, doctorId, payload);

      return manager.save(
        manager.create(DoctorAvailability, { doctorId, ...payload }),
      );
    });
  }

  async bulkSyncAvailability(
    doctorId: number,
    dto: BulkDoctorAvailabilityDto,
  ): Promise<{
    previous: DoctorAvailability[];
    current: DoctorAvailability[];
  }> {
    await this.doctorsService.assertDoctorExists(doctorId);

    const payloads = dto.blocks.map((block) =>
      this.buildAvailabilityPayload(block),
    );
    this.assertBulkDoesNotOverlap(payloads);

    return this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(DoctorAvailability);

      const previous = await repo
        .createQueryBuilder('availability')
        .where('availability.doctorId = :doctorId', { doctorId })
        .andWhere('availability.isRecurring = :isRecurring', {
          isRecurring: true,
        })
        .orderBy('availability.dayOfWeek', 'ASC')
        .addOrderBy('availability.startTime', 'ASC')
        .getMany();

      if (previous.length > 0) {
        await repo.softDelete({ doctorId, isRecurring: true });
      }

      const current = await repo.save(
        payloads.map((payload) => repo.create({ doctorId, ...payload })),
      );

      return { previous, current };
    });
  }

  async updateAvailability(
    doctorId: number,
    id: number,
    dto: UpdateDoctorAvailabilityDto,
  ): Promise<DoctorAvailability> {
    return this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(DoctorAvailability);

      const current = await repo
        .createQueryBuilder('availability')
        .where('availability.id = :id', { id })
        .andWhere('availability.doctorId = :doctorId', { doctorId })
        .getOne();

      if (!current) {
        throw new NotFoundException(
          'La disponibilidad no está registrada para el médico.',
        );
      }

      const payload = this.buildAvailabilityPayload(dto, current);
      await this.assertAvailabilityIsFree(
        manager,
        doctorId,
        payload,
        current.id,
      );

      await repo
        .createQueryBuilder()
        .update(DoctorAvailability)
        .set(payload)
        .where('id = :id', { id })
        .execute();

      return repo
        .createQueryBuilder('availability')
        .where('availability.id = :id', { id })
        .getOneOrFail();
    });
  }

  async removeAvailability(doctorId: number, id: number): Promise<void> {
    const isExist = await this.doctorAvailabilityRepository
      .createQueryBuilder('availability')
      .where('availability.id = :id', { id })
      .andWhere('availability.doctorId = :doctorId', { doctorId })
      .getOne();

    if (!isExist) {
      throw new NotFoundException(
        'La disponibilidad no está registrada para el médico.',
      );
    }

    return this.dataSource.transaction(async (manager) => {
      await manager.softDelete(DoctorAvailability, { id: isExist.id });
    });
  }

  async availableSlots(
    doctorId: number,
    dto: AvailableSlotsDto,
  ): Promise<{
    date: string;
    slots: { startTime: string; endTime: string }[];
  }> {
    await this.doctorsService.assertDoctorExists(doctorId);

    const target = new Date(`${dto.date}T12:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (target.getTime() < today.getTime()) {
      throw new BadRequestException(
        'No se pueden consultar slots de fechas pasadas.',
      );
    }

    const blocks = await this.doctorAvailabilityRepository
      .createQueryBuilder('availability')
      .where('availability.doctorId = :doctorId', { doctorId })
      .andWhere(
        '(availability.isRecurring = true AND availability.dayOfWeek = :dayOfWeek) OR (availability.isRecurring = false AND availability.specificDate = :specificDate)',
        {
          dayOfWeek: target.getDay() as DayOfWeek,
          specificDate: dto.date,
        },
      )
      .getMany();

    const unavailabilities = await this.doctorUnavailabilityRepository
      .createQueryBuilder('unavailability')
      .where('unavailability.doctorId = :doctorId', { doctorId })
      .getMany();

    const now = new Date();
    const slots = new Map<string, { startTime: string; endTime: string }>();

    for (const block of blocks) {
      const end = toMinutes(block.endTime);

      for (
        let start = toMinutes(block.startTime);
        start + block.slotDuration <= end;
        start += block.slotDuration
      ) {
        const label = toClock(start);
        const slotStart = new Date(`${dto.date}T${label}`);
        if (slotStart.getTime() <= now.getTime()) continue;

        const slotEnd = new Date(
          slotStart.getTime() + block.slotDuration * 60_000,
        );

        const blocked = unavailabilities.some(
          (item) => item.startTime < slotEnd && item.endTime > slotStart,
        );
        if (blocked) continue;

        if (!slots.has(label)) {
          slots.set(label, {
            startTime: label,
            endTime: toClock(start + block.slotDuration),
          });
        }
      }
    }

    return {
      date: dto.date,
      slots: [...slots.values()].sort((a, b) =>
        a.startTime.localeCompare(b.startTime),
      ),
    };
  }

  async slots(
    doctorId: number,
    dto: QueryDoctorSlotsDto,
  ): Promise<{
    date: string;
    slots: DoctorSlotResponseDto[];
  }> {
    await this.doctorsService.assertDoctorExists(doctorId);

    const target = new Date(`${dto.date}T12:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (target.getTime() < today.getTime()) {
      throw new BadRequestException(
        'No se pueden consultar slots de fechas pasadas.',
      );
    }

    const blocks = await this.doctorAvailabilityRepository
      .createQueryBuilder('availability')
      .where('availability.doctorId = :doctorId', { doctorId })
      .andWhere(
        '(availability.isRecurring = true AND availability.dayOfWeek = :dayOfWeek) OR (availability.isRecurring = false AND availability.specificDate = :specificDate)',
        {
          dayOfWeek: target.getDay() as DayOfWeek,
          specificDate: dto.date,
        },
      )
      .getMany();

    const unavailabilities = await this.doctorUnavailabilityRepository
      .createQueryBuilder('unavailability')
      .where('unavailability.doctorId = :doctorId', { doctorId })
      .getMany();

    const now = new Date();
    const slots = new Map<string, DoctorSlotResponseDto>();

    for (const block of blocks) {
      const end = toMinutes(block.endTime);
      const slotDuration = block.slotDuration;
      const maxCapacity = block.maxPatientsPerSlot;

      for (
        let start = toMinutes(block.startTime);
        start + slotDuration <= end;
        start += slotDuration
      ) {
        const label = toClock(start);
        const slotStart = new Date(`${dto.date}T${label}`);
        if (slotStart.getTime() <= now.getTime()) continue;

        const slotEnd = new Date(slotStart.getTime() + slotDuration * 60_000);

        const blocked = unavailabilities.some(
          (item) => item.startTime < slotEnd && item.endTime > slotStart,
        );
        if (blocked) continue;

        if (!slots.has(label)) {
          slots.set(label, {
            startTime: label,
            endTime: toClock(start + slotDuration),
            maxCapacity,
            occupiedSpots: 0,
            availableSpots: maxCapacity,
            isAvailable: true,
          });
        }
      }
    }

    // Los occupiedSpots de cada slot se deben cruzar contra la tabla `appointment`
    // una vez que exista la entidad. Consultar las citas del doctor en la fecha con
    // estado activo (scheduled, confirmed, waiting, in_progress) que caigan dentro de
    // cada slot [startTime, endTime) y sumarlas. Si availableSpots <= 0 -> isAvailable = false.

    return {
      date: dto.date,
      slots: [...slots.values()].sort((a, b) =>
        a.startTime.localeCompare(b.startTime),
      ),
    };
  }

  private buildAvailabilityPayload(
    dto: CreateDoctorAvailabilityDto | UpdateDoctorAvailabilityDto,
    current?: DoctorAvailability,
  ): AvailabilityPayload {
    const isRecurring = dto.isRecurring ?? current?.isRecurring ?? true;
    const dayOfWeek = dto.dayOfWeek ?? current?.dayOfWeek ?? null;
    const specificDate = dto.specificDate ?? current?.specificDate ?? null;

    if (isRecurring && dto.specificDate !== undefined) {
      throw new BadRequestException(
        'Un bloque recurrente no puede tener fecha específica.',
      );
    }

    if (!isRecurring && dto.dayOfWeek !== undefined) {
      throw new BadRequestException(
        'Un bloque no recurrente no puede tener día de la semana.',
      );
    }

    if (isRecurring && dayOfWeek === null) {
      throw new BadRequestException(
        'Un bloque recurrente necesita el campo día de la semana.',
      );
    }

    if (!isRecurring && specificDate === null) {
      throw new BadRequestException(
        'Un bloque no recurrente necesita el campo fecha específica.',
      );
    }

    const rawStart = dto.startTime ?? current?.startTime;
    const rawEnd = dto.endTime ?? current?.endTime;
    if (!rawStart || !rawEnd) {
      throw new BadRequestException(
        'Las horas de inicio y fin del bloque son obligatorias.',
      );
    }

    const startTime = toTimeString(rawStart);
    const endTime = toTimeString(rawEnd);

    if (endTime <= startTime) {
      throw new BadRequestException(
        'La hora de fin debe ser posterior a la hora de inicio.',
      );
    }

    const slotDuration =
      dto.slotDuration ?? current?.slotDuration ?? DEFAULT_SLOT_DURATION;

    if ((toMinutes(endTime) - toMinutes(startTime)) % slotDuration !== 0) {
      throw new BadRequestException(
        'La duración del bloque debe ser un múltiplo de la duración del turno.',
      );
    }

    return {
      startTime,
      endTime,
      slotDuration,
      maxPatientsPerSlot:
        dto.maxPatientsPerSlot ?? current?.maxPatientsPerSlot ?? 1,
      isRecurring,
      dayOfWeek: isRecurring ? dayOfWeek : null,
      specificDate: isRecurring ? null : specificDate,
    };
  }

  private assertBulkDoesNotOverlap(payloads: AvailabilityPayload[]): void {
    for (let i = 0; i < payloads.length; i++) {
      for (let j = i + 1; j < payloads.length; j++) {
        const a = payloads[i];
        const b = payloads[j];

        const sameDay =
          (a.isRecurring && b.isRecurring && a.dayOfWeek === b.dayOfWeek) ||
          (!a.isRecurring &&
            !b.isRecurring &&
            a.specificDate === b.specificDate);

        if (sameDay && a.startTime < b.endTime && a.endTime > b.startTime) {
          throw new ConflictException(
            'Los bloques de la plantilla se solapan entre sí.',
          );
        }
      }
    }
  }

  private async assertAvailabilityIsFree(
    manager: EntityManager,
    doctorId: number,
    payload: AvailabilityPayload,
    excludeId?: number,
  ): Promise<void> {
    const rows = await manager
      .getRepository(DoctorAvailability)
      .createQueryBuilder('availability')
      .where('availability.doctorId = :doctorId', { doctorId })
      .getMany();

    const conflict = rows.some(
      (row) =>
        row.id !== excludeId &&
        row.isRecurring === payload.isRecurring &&
        (payload.isRecurring
          ? row.dayOfWeek === payload.dayOfWeek
          : row.specificDate === payload.specificDate) &&
        row.startTime < payload.endTime &&
        row.endTime > payload.startTime,
    );

    if (conflict) {
      throw new ConflictException(
        'El bloque se solapa con otro bloque de disponibilidad del mismo doctor.',
      );
    }
  }
}
