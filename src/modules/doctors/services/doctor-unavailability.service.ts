import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DoctorUnavailability } from '../entities/doctor-unavailability.entity.js';
import { Doctor } from '../entities/doctor.entity.js';

import { CreateDoctorUnavailabilityDto } from '../dto/create-doctor-unavailability.dto.js';
import { UpdateDoctorUnavailabilityDto } from '../dto/update-doctor-unavailability.dto.js';

interface UnavailabilityPayload {
  startTime: Date;
  endTime: Date;
  reason: string | null;
}

@Injectable()
export class DoctorUnavailabilityService {
  constructor(
    @InjectRepository(DoctorUnavailability)
    private readonly doctorUnavailabilityRepository: Repository<DoctorUnavailability>,
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
  ) {}

  async findUnavailability(doctorId: number): Promise<DoctorUnavailability[]> {
    await this.assertDoctorExists(doctorId);
    return this.doctorUnavailabilityRepository.find({
      where: { doctorId },
      order: { startTime: 'ASC' },
    });
  }

  async addUnavailability(
    doctorId: number,
    dto: CreateDoctorUnavailabilityDto,
  ): Promise<DoctorUnavailability> {
    await this.assertDoctorExists(doctorId);

    const payload = this.buildUnavailabilityPayload(dto);
    await this.assertUnavailabilityIsFree(doctorId, payload);

    return this.doctorUnavailabilityRepository.save(
      this.doctorUnavailabilityRepository.create({ doctorId, ...payload }),
    );
  }

  async updateUnavailability(
    doctorId: number,
    id: number,
    dto: UpdateDoctorUnavailabilityDto,
  ): Promise<DoctorUnavailability> {
    const current = await this.findUnavailabilityRow(doctorId, id);

    const payload = this.buildUnavailabilityPayload(dto, current);
    await this.assertUnavailabilityIsFree(doctorId, payload, current.id);

    await this.doctorUnavailabilityRepository.update(current.id, payload);
    return this.doctorUnavailabilityRepository.findOneOrFail({
      where: { id: current.id },
    });
  }

  async removeUnavailability(doctorId: number, id: number): Promise<void> {
    const current = await this.findUnavailabilityRow(doctorId, id);
    await this.doctorUnavailabilityRepository.softDelete(current.id);
  }

  private async assertDoctorExists(doctorId: number): Promise<void> {
    const exists = await this.doctorRepository.exist({
      where: { id: doctorId },
    });

    if (!exists) {
      throw new NotFoundException(`Doctor with id ${doctorId} not found`);
    }
  }

  private async findUnavailabilityRow(
    doctorId: number,
    id: number,
  ): Promise<DoctorUnavailability> {
    const row = await this.doctorUnavailabilityRepository.findOne({
      where: { id, doctorId },
    });

    if (!row) {
      throw new NotFoundException(
        `Unavailability ${id} is not registered for doctor ${doctorId}`,
      );
    }

    return row;
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
    doctorId: number,
    payload: UnavailabilityPayload,
    excludeId?: number,
  ): Promise<void> {
    const rows = await this.doctorUnavailabilityRepository.find({
      where: { doctorId },
    });

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
