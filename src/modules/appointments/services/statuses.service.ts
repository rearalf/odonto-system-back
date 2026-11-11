import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ALLOWED_STATUS_TRANSITIONS,
  AppointmentStatusName,
} from '../constants/appointment-status.constant.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Appointment } from '../entities/appointment.entity.js';
import { AppointmentStatus } from '../entities/appointment-status.entity.js';
import { Repository } from 'typeorm';
import { UpdateAppointmentStatusResponseDto } from '../dto/appointment-status-response.dto.js';
import { UpdateAppointmentStatusDto } from '../dto/update-appointment-status.dto.js';

@Injectable()
export class StatusesService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(AppointmentStatus)
    private readonly appointmentStatusRepository: Repository<AppointmentStatus>,
  ) {}

  async getStatuses(): Promise<AppointmentStatus[]> {
    const status = await this.appointmentStatusRepository
      .createQueryBuilder('appointment_status')
      .where('appointment_status.isActive = true')
      .orderBy('appointment_status.sortOrder', 'ASC')
      .select([
        'appointment_status.id',
        'appointment_status.name',
        'appointment_status.color',
        'appointment_status.description',
      ])
      .getMany();

    return JSON.parse(JSON.stringify(status));
  }

  async updateStatus(
    id: number,
    updateStatusDto: UpdateAppointmentStatusDto,
  ): Promise<UpdateAppointmentStatusResponseDto> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id },
      relations: {
        status: true,
      },
    });

    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found.`);
    }

    const targetStatus = await this.appointmentStatusRepository.findOne({
      where: { id: updateStatusDto.statusId },
    });

    if (!targetStatus) {
      throw new BadRequestException(
        `El estado de destino con ID ${updateStatusDto.statusId} no existe.`,
      );
    }

    const currentStatusName = appointment.status
      .description as AppointmentStatusName;

    const allowedTargets = ALLOWED_STATUS_TRANSITIONS[currentStatusName];
    if (
      !allowedTargets ||
      !allowedTargets.includes(targetStatus.name as AppointmentStatusName)
    ) {
      throw new BadRequestException(
        `No se puede pasar la cita de "${currentStatusName}" a "${targetStatus.description}". Transición de estado no permitida.`,
      );
    }

    appointment.statusId = updateStatusDto.statusId;
    appointment.status = undefined as any;
    const saved = await this.appointmentRepository.save(appointment);

    return {
      id: saved.id,
      statusId: saved.statusId,
      status: {
        id: saved.status.id,
        name: saved.status.name,
        color: saved.status.color,
        description: saved.status.description ?? null,
      },
    } as UpdateAppointmentStatusResponseDto;
  }

  isTransitionAllowed = (
    from: AppointmentStatusName,
    to: AppointmentStatusName,
  ): boolean => {
    return ALLOWED_STATUS_TRANSITIONS[from]?.includes(to) ?? false;
  };
}
