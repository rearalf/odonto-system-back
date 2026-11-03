import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThan, MoreThan, Not, In } from 'typeorm';

import { Appointment } from './entities/appointment.entity.js';
import { Doctor } from '../doctors/entities/doctor.entity.js';
import { Patient } from '../patients/entities/patient.entity.js';

import { CreateAppointmentDto } from './dto/create-appointment.dto.js';
import { RescheduleAppointmentDto } from './dto/reschedule-appointment.dto.js';
import { UpdateAppointmentStatusDto } from './dto/update-appointment-status.dto.js';
import { QueryAppointmentsDto } from './dto/query-appointments.dto.js';
import { AppointmentStatus } from '../../common/enums/appointment-status.js';
import { AvailableSlotDto } from './dto/available-slot.dto.js';
import { AvailableSlotsQueryDto } from './dto/available-slots-query.dto.js';
import {
  PaginationHelper,
  PaginationMeta,
} from '../../common/helpers/pagination-helper.js';
import { AppointmentListDto } from './dto/appointment-list.dto.js';
import { CreateAppointmentResponseDto } from './dto/create-appointment-response.dto.js';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
  ) {}

  async create(
    createDto: CreateAppointmentDto,
  ): Promise<CreateAppointmentResponseDto> {
    const startTime = new Date(createDto.start_time);
    const endTime = new Date(createDto.end_time);

    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      throw new BadRequestException(
        'Formato de fecha inválido para start_time o end_time.',
      );
    }

    if (startTime >= endTime) {
      throw new BadRequestException(
        'start_time debe ser estrictamente anterior a end_time.',
      );
    }

    const isWalkIn = createDto.is_walk_in ?? false;
    let status = createDto.status;

    if (isWalkIn) {
      const validWalkInStatuses = [
        AppointmentStatus.WAITING,
        AppointmentStatus.IN_PROGRESS,
      ];
      status = validWalkInStatuses.includes(status as AppointmentStatus)
        ? status
        : AppointmentStatus.WAITING;

      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
      if (startTime < thirtyMinutesAgo) {
        throw new BadRequestException(
          'La hora de una cita Walk-in no puede superar los 30 minutos en el pasado.',
        );
      }
    } else {
      const validRegularStatuses = [
        AppointmentStatus.SCHEDULED,
        AppointmentStatus.CONFIRMED,
      ];
      status = validRegularStatuses.includes(status as AppointmentStatus)
        ? status
        : AppointmentStatus.SCHEDULED;

      if (startTime < new Date()) {
        throw new BadRequestException(
          'No se pueden programar citas regulares en fechas u horas pasadas.',
        );
      }
    }

    const [doctor, patient] = await Promise.all([
      this.doctorRepository.findOne({
        where: { id: createDto.doctor_id },
        relations: { person: true },
      }),
      this.patientRepository.findOne({
        where: { id: createDto.patient_id },
        relations: { person: true },
      }),
    ]);

    if (!doctor)
      throw new NotFoundException(
        `Doctor ${createDto.doctor_id} no encontrado.`,
      );
    if (!patient)
      throw new NotFoundException(
        `Paciente ${createDto.patient_id} no encontrado.`,
      );

    const shouldCheckCollision = !(
      isWalkIn && createDto.allow_overbooking === true
    );

    if (shouldCheckCollision) {
      await this.validateDoctorAvailability(
        createDto.doctor_id,
        startTime,
        endTime,
      );
    }

    const appointment = this.appointmentRepository.create({
      reason: createDto.reason,
      notes: createDto.notes,
      status,
      startTime,
      endTime,
      doctorId: createDto.doctor_id,
      patientId: createDto.patient_id,
      isWalkIn,
    });

    const saved = await this.appointmentRepository.save(appointment);
    return this.mapToCreateResponseDto(saved, doctor, patient);
  }

  async findAll(
    query: QueryAppointmentsDto,
  ): Promise<{ data: AppointmentListDto[]; meta: PaginationMeta | null }> {
    const qb = this.appointmentRepository
      .createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.doctor', 'doctor')
      .leftJoinAndSelect('appointment.patient', 'patient')
      .leftJoinAndSelect('patient.person', 'person')
      .leftJoinAndSelect('doctor.person', 'doctorPerson')
      .orderBy('appointment.startTime', 'ASC');

    if (query.doctorId) {
      qb.andWhere('appointment.doctorId = :doctorId', {
        doctorId: query.doctorId,
      });
    }

    if (query.from) {
      const fromDate = new Date(query.from);
      if (!isNaN(fromDate.getTime())) {
        qb.andWhere('appointment.startTime >= :fromDate', { fromDate });
      }
    }

    if (query.to) {
      const toDate = new Date(query.to);
      if (!isNaN(toDate.getTime())) {
        qb.andWhere('appointment.endTime <= :toDate', { toDate });
      }
    }

    if (query.patientName) {
      const name = `%${query.patientName}%`;
      qb.andWhere(
        '(person.firstName ILIKE :name OR person.middleName ILIKE :name OR person.lastName ILIKE :name)',
        { name },
      );
    }

    if (query.status?.length) {
      qb.andWhere('appointment.status IN (:...status)', {
        status: query.status,
      });
    }

    const sortBy = query.sortBy ?? 'startTime';
    const sortOrder = query.sortOrder ?? 'ASC';
    const allowedFields = [
      'startTime',
      'endTime',
      'createdAt',
      'updatedAt',
      'modifiedAt',
    ];
    const safeSortBy = allowedFields.includes(sortBy) ? sortBy : 'startTime';

    qb.orderBy(`appointment.${safeSortBy}`, sortOrder);

    const { pagination = true, page = 1, per_page: perPage = 10 } = query;

    if (pagination) {
      qb.skip((page - 1) * perPage).take(perPage);
    }

    if (pagination) {
      const [data, total] = await qb.getManyAndCount();
      const mappedData = data.map((a) => this.mapToListDto(a));
      return {
        data: mappedData,
        meta: PaginationHelper.buildMeta(total, query),
      };
    }

    const data = await qb.getMany();
    return { data: data.map((a) => this.mapToListDto(a)), meta: null };
  }

  async findOne(id: number): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id },
      relations: {
        doctor: true,
        patient: true,
      },
    });

    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found.`);
    }

    return appointment;
  }

  async reschedule(
    id: number,
    rescheduleDto: RescheduleAppointmentDto,
  ): Promise<Appointment> {
    const appointment = await this.findOne(id);

    if (
      appointment.status === AppointmentStatus.CANCELLED ||
      appointment.status === AppointmentStatus.COMPLETED
    ) {
      throw new BadRequestException(
        `Cannot reschedule an appointment that is already ${appointment.status}.`,
      );
    }

    const newStartTime = new Date(rescheduleDto.start_time);
    const newEndTime = new Date(rescheduleDto.end_time);

    if (isNaN(newStartTime.getTime()) || isNaN(newEndTime.getTime())) {
      throw new BadRequestException('Invalid start_time or end_time format.');
    }

    if (newStartTime >= newEndTime) {
      throw new BadRequestException(
        'start_time must be strictly before end_time.',
      );
    }

    await this.validateDoctorAvailability(
      appointment.doctorId,
      newStartTime,
      newEndTime,
      appointment.id,
    );

    appointment.startTime = newStartTime;
    appointment.endTime = newEndTime;
    appointment.modifiedAt = new Date();
    appointment.modificationReason = rescheduleDto.modification_reason;

    return await this.appointmentRepository.save(appointment);
  }

  async updateStatus(
    id: number,
    updateStatusDto: UpdateAppointmentStatusDto,
  ): Promise<Appointment> {
    const appointment = await this.findOne(id);

    if (
      appointment.status === AppointmentStatus.CANCELLED &&
      updateStatusDto.status !== AppointmentStatus.SCHEDULED
    ) {
      throw new BadRequestException(
        'Cannot modify a cancelled appointment unless rescheduled.',
      );
    }

    appointment.status = updateStatusDto.status;
    return await this.appointmentRepository.save(appointment);
  }

  async getDoctorAvailableSlots(
    doctorId: number,
    query: AvailableSlotsQueryDto,
  ): Promise<AvailableSlotDto[]> {
    const doctorExists = await this.doctorRepository.exists({
      where: { id: doctorId },
    });
    if (!doctorExists) {
      throw new NotFoundException(`Doctor with ID ${doctorId} not found.`);
    }

    const [year, month, day] = query.date.split('-').map(Number);
    if (!year || !month || !day) {
      throw new BadRequestException('Date format must be YYYY-MM-DD.');
    }

    const dayStart = new Date(Date.UTC(year, month - 1, day, 8, 0, 0));
    const dayEnd = new Date(Date.UTC(year, month - 1, day, 17, 0, 0));
    const slotDurationMinutes = 30;

    const now = new Date();

    if (dayEnd <= now) {
      return [];
    }

    const activeAppointments = await this.appointmentRepository
      .createQueryBuilder('appointment')
      .where('appointment.doctorId = :doctorId', { doctorId })
      .andWhere('appointment.status NOT IN (:...cancelledStatuses)', {
        cancelledStatuses: [AppointmentStatus.CANCELLED],
      })
      .andWhere('appointment.startTime < :dayEnd', { dayEnd })
      .andWhere('appointment.endTime > :dayStart', { dayStart })
      .orderBy('appointment.startTime', 'ASC')
      .getMany();

    const slots: AvailableSlotDto[] = [];
    let currentSlotStart = new Date(dayStart);

    const isToday =
      now.getUTCFullYear() === year &&
      now.getUTCMonth() === month - 1 &&
      now.getUTCDate() === day;

    while (
      currentSlotStart.getTime() + slotDurationMinutes * 60000 <=
      dayEnd.getTime()
    ) {
      const currentSlotEnd = new Date(
        currentSlotStart.getTime() + slotDurationMinutes * 60000,
      );

      if (isToday && currentSlotStart < now) {
        currentSlotStart = new Date(currentSlotEnd);
        continue;
      }

      const hasCollision = activeAppointments.some(
        (appt) =>
          currentSlotStart < new Date(appt.endTime) &&
          currentSlotEnd > new Date(appt.startTime),
      );

      if (!hasCollision) {
        slots.push({
          start_time: currentSlotStart.toISOString(),
          end_time: currentSlotEnd.toISOString(),
        });
      }

      currentSlotStart = new Date(currentSlotEnd);
    }

    return slots;
  }

  private async validateDoctorAvailability(
    doctorId: number,
    startTime: Date,
    endTime: Date,
    excludeAppointmentId?: number,
  ): Promise<void> {
    const qb = this.appointmentRepository
      .createQueryBuilder('appointment')
      .where('appointment.doctorId = :doctorId', { doctorId })
      .andWhere('appointment.status NOT IN (:...cancelledStatuses)', {
        cancelledStatuses: [AppointmentStatus.CANCELLED],
      })
      .andWhere('appointment.startTime < :endTime', { endTime })
      .andWhere('appointment.endTime > :startTime', { startTime });

    if (excludeAppointmentId) {
      qb.andWhere('appointment.id != :excludeAppointmentId', {
        excludeAppointmentId,
      });
    }

    const collision = await qb.getOne();

    if (collision) {
      throw new ConflictException(
        `The doctor already has an active appointment between ${collision.startTime.toISOString()} and ${collision.endTime.toISOString()}.`,
      );
    }
  }

  private mapToListDto(a: Appointment): AppointmentListDto {
    const patientPerson = a.patient?.person;
    const doctorPerson = a.doctor?.person;
    const start = new Date(a.startTime);
    const end = new Date(a.endTime);
    const created = new Date(a.createdAt);
    const modified = a.modifiedAt ? new Date(a.modifiedAt) : null;

    const statusColorMap: Record<AppointmentStatus, string> = {
      [AppointmentStatus.SCHEDULED]: 'blue',
      [AppointmentStatus.CONFIRMED]: 'teal',
      [AppointmentStatus.WAITING]: 'amber',
      [AppointmentStatus.IN_PROGRESS]: 'purple',
      [AppointmentStatus.COMPLETED]: 'green',
      [AppointmentStatus.CANCELLED]: 'red',
      [AppointmentStatus.NO_SHOW]: 'gray',
    };

    const fullName = (p: typeof patientPerson) =>
      [p?.firstName, p?.middleName, p?.lastName].filter(Boolean).join(' ');

    return {
      id: a.id,
      patientId: a.patientId,
      doctorId: a.doctorId,
      startTime: a.startTime,
      endTime: a.endTime,
      status: a.status,
      reason: a.reason,
      isWalkIn: a.isWalkIn,
      patientFullName: fullName(patientPerson),
      doctorFullName: fullName(doctorPerson),
      statusColor: statusColorMap[a.status] ?? 'gray',
      durationMinutes: Math.round((end.getTime() - start.getTime()) / 60000),
      rescheduled: modified !== null && start.getTime() !== created.getTime(),
      createdAt: a.createdAt,
      modifiedAt: a.modifiedAt ?? undefined,
    };
  }

  private mapToCreateResponseDto(
    appointment: Appointment,
    doctor: Doctor,
    patient: Patient,
  ): CreateAppointmentResponseDto {
    const fullName = (p: typeof patient.person) =>
      [p?.firstName, p?.middleName, p?.lastName].filter(Boolean).join(' ');

    return {
      id: appointment.id,
      patientId: appointment.patientId,
      patientFullName: fullName(patient.person),
      doctorId: appointment.doctorId,
      doctorFullName: fullName(doctor.person),
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      status: appointment.status,
    };
  }
}
