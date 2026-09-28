import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DoctorAvailability } from '../entities/doctor-availability.entity.js';
import { DoctorUnavailability } from '../entities/doctor-unavailability.entity.js';
import { Doctor } from '../entities/doctor.entity.js';

import { AvailableSlotsDto } from '../dto/available-slots.dto.js';
import { CreateDoctorAvailabilityDto } from '../dto/create-doctor-availability.dto.js';
import { UpdateDoctorAvailabilityDto } from '../dto/update-doctor-availability.dto.js';

import { DayOfWeek } from '../../../common/enums/day-of-week.enum.js';

const DEFAULT_SLOT_DURATION = 30;

interface AvailabilityPayload {
  startTime: string;
  endTime: string;
  slotDuration: number;
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
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
  ) {}

  async findAvailability(doctorId: number): Promise<DoctorAvailability[]> {
    await this.assertDoctorExists(doctorId);
    return this.doctorAvailabilityRepository.find({
      where: { doctorId },
      order: { dayOfWeek: 'ASC', specificDate: 'ASC', startTime: 'ASC' },
    });
  }

  async addAvailability(
    doctorId: number,
    dto: CreateDoctorAvailabilityDto,
  ): Promise<DoctorAvailability> {
    await this.assertDoctorExists(doctorId);

    const payload = this.buildAvailabilityPayload(dto);
    await this.assertAvailabilityIsFree(doctorId, payload);

    return this.doctorAvailabilityRepository.save(
      this.doctorAvailabilityRepository.create({ doctorId, ...payload }),
    );
  }

  async updateAvailability(
    doctorId: number,
    id: number,
    dto: UpdateDoctorAvailabilityDto,
  ): Promise<DoctorAvailability> {
    const current = await this.findAvailabilityRow(doctorId, id);

    const payload = this.buildAvailabilityPayload(dto, current);
    await this.assertAvailabilityIsFree(doctorId, payload, current.id);

    await this.doctorAvailabilityRepository.update(current.id, payload);
    return this.doctorAvailabilityRepository.findOneOrFail({
      where: { id: current.id },
    });
  }

  async removeAvailability(doctorId: number, id: number): Promise<void> {
    const current = await this.findAvailabilityRow(doctorId, id);
    await this.doctorAvailabilityRepository.softDelete(current.id);
  }

  async availableSlots(
    doctorId: number,
    dto: AvailableSlotsDto,
  ): Promise<{
    date: string;
    slots: { startTime: string; endTime: string }[];
  }> {
    await this.assertDoctorExists(doctorId);

    const target = new Date(`${dto.date}T12:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (target.getTime() < today.getTime()) {
      throw new BadRequestException(
        'No se pueden consultar slots de fechas pasadas.',
      );
    }

    const blocks = await this.doctorAvailabilityRepository.find({
      where: [
        {
          doctorId,
          isRecurring: true,
          dayOfWeek: target.getDay() as DayOfWeek,
        },
        { doctorId, isRecurring: false, specificDate: dto.date },
      ],
    });

    const unavailabilities = await this.doctorUnavailabilityRepository.find({
      where: { doctorId },
    });

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

  private async assertDoctorExists(doctorId: number): Promise<void> {
    const exists = await this.doctorRepository.exist({
      where: { id: doctorId },
    });

    if (!exists) {
      throw new NotFoundException(`Doctor with id ${doctorId} not found`);
    }
  }

  private async findAvailabilityRow(
    doctorId: number,
    id: number,
  ): Promise<DoctorAvailability> {
    const row = await this.doctorAvailabilityRepository.findOne({
      where: { id, doctorId },
    });

    if (!row) {
      throw new NotFoundException(
        `Availability ${id} is not registered for doctor ${doctorId}`,
      );
    }

    return row;
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

    return {
      startTime,
      endTime,
      slotDuration:
        dto.slotDuration ?? current?.slotDuration ?? DEFAULT_SLOT_DURATION,
      isRecurring,
      dayOfWeek: isRecurring ? dayOfWeek : null,
      specificDate: isRecurring ? null : specificDate,
    };
  }

  private async assertAvailabilityIsFree(
    doctorId: number,
    payload: AvailabilityPayload,
    excludeId?: number,
  ): Promise<void> {
    const rows = await this.doctorAvailabilityRepository.find({
      where: { doctorId },
    });

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
