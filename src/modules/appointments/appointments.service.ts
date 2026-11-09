import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, DataSource, EntityManager } from 'typeorm';

import { Appointment } from './entities/appointment.entity.js';
import { AppointmentStatus } from './entities/appointment-status.entity.js';
import { Doctor } from '../doctors/entities/doctor.entity.js';
import { Patient } from '../patients/entities/patient.entity.js';
import { Person } from '../persons/entities/person.entity.js';

import { CreateAppointmentWithPatientDto } from './dto/create-appointment-with-patient.dto.js';
import { RescheduleAppointmentDto } from './dto/reschedule-appointment.dto.js';
import { UpdateAppointmentStatusDto } from './dto/update-appointment-status.dto.js';
import { QueryAppointmentsDto } from './dto/query-appointments.dto.js';
import { AvailableSlotDto } from './dto/available-slot.dto.js';
import { AvailableSlotsQueryDto } from './dto/available-slots-query.dto.js';
import {
  PaginationHelper,
  PaginationMeta,
} from '../../common/helpers/pagination-helper.js';
import { AppointmentListDto } from './dto/appointment-list.dto.js';
import { CreateAppointmentResponseDto } from './dto/create-appointment-response.dto.js';
import { PersonsService } from '../persons/persons.service.js';
import { PERSON_TYPE_ID } from '../../common/enums/person-type.enum.js';
import { AppointmentDetailResponseDto } from './dto/appointment-detail-response.dto.js';

// Status name constants for business logic (avoid magic strings)
const STATUS = {
  SCHEDULED: 'scheduled',
  CONFIRMED: 'confirmed',
  WAITING: 'waiting',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show',
  REJECTED: 'rejected',
} as const;

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(AppointmentStatus)
    private readonly appointmentStatusRepository: Repository<AppointmentStatus>,
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
    private readonly personsService: PersonsService,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    dto: CreateAppointmentWithPatientDto,
    _profilePicture?: Express.Multer.File,
  ): Promise<CreateAppointmentResponseDto> {
    const startTime = new Date(dto.start_time);
    const endTime = new Date(dto.end_time);

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

    // Validate patient fields if creating new patient
    if (!dto.patient_id) {
      const requiredFields = [
        'firstName',
        'lastName',
        'birthDate',
        'gender',
        'completeOdontogram',
      ];
      for (const field of requiredFields) {
        if (
          dto[field as keyof CreateAppointmentWithPatientDto] === undefined ||
          dto[field as keyof CreateAppointmentWithPatientDto] === null
        ) {
          throw new BadRequestException(
            `El campo ${field} es requerido al crear un paciente nuevo.`,
          );
        }
      }
    }

    const isWalkIn = dto.is_walk_in ?? false;
    let statusId = dto.statusId;

    if (isWalkIn) {
      const validWalkInStatusNames = [STATUS.WAITING, STATUS.IN_PROGRESS];
      const validStatuses = await this.appointmentStatusRepository.find({
        where: { name: In(validWalkInStatusNames) },
      });
      const validStatusIds = validStatuses.map((s) => s.id);
      statusId = validStatusIds.includes(statusId as number)
        ? statusId
        : (validStatuses.find((s) => s.name === STATUS.WAITING)?.id ?? 1);

      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
      if (startTime < thirtyMinutesAgo) {
        throw new BadRequestException(
          'La hora de una cita Walk-in no puede superar los 30 minutos en el pasado.',
        );
      }
    } else {
      const validRegularStatusNames = [STATUS.SCHEDULED, STATUS.CONFIRMED];
      const validStatuses = await this.appointmentStatusRepository.find({
        where: { name: In(validRegularStatusNames) },
      });
      const validStatusIds = validStatuses.map((s) => s.id);
      statusId = validStatusIds.includes(statusId as number)
        ? statusId
        : (validStatuses.find((s) => s.name === STATUS.SCHEDULED)?.id ?? 1);

      if (startTime < new Date()) {
        throw new BadRequestException(
          'No se pueden programar citas regulares en fechas u horas pasadas.',
        );
      }
    }

    // Execute everything in a single transaction
    const savedAppointment = await this.dataSource.transaction(
      async (manager: EntityManager) => {
        // 1. Verify doctor exists
        const doctor = await manager.findOne(Doctor, {
          where: { id: dto.doctor_id },
          relations: { person: true },
        });
        if (!doctor) {
          throw new NotFoundException(`Doctor ${dto.doctor_id} no encontrado.`);
        }

        // 2. Get or create patient
        let patientId = dto.patient_id;

        if (!patientId) {
          // Create Person
          const person = await this.personsService.createWithManager(manager, {
            firstName: dto.firstName!,
            middleName: dto.middleName,
            lastName: dto.lastName!,
            userId: dto.userId,
            personTypeId: PERSON_TYPE_ID.PATIENT,
            phone: dto.phone,
            address: dto.address,
            occupation: dto.occupation,
          });

          // Create Patient
          const patient = manager.create(Patient, {
            birthDate: dto.birthDate!,
            gender: dto.gender!,
            medicalHistory: dto.medicalHistory,
            allergicReactions: dto.allergicReactions,
            currentSystemicTreatment: dto.currentSystemicTreatment,
            labResults: dto.labResults,
            completeOdontogram: dto.completeOdontogram!,
            hasSncIssues: dto.hasSncIssues ?? false,
            hasSvcIssues: dto.hasSvcIssues ?? false,
            hasSeIssues: dto.hasSeIssues ?? false,
            hasSmeIssues: dto.hasSmeIssues ?? false,
            hasSrIssues: dto.hasSrIssues ?? false,
            hasSuIssues: dto.hasSuIssues ?? false,
            hasSguIssues: dto.hasSguIssues ?? false,
            hasSgiIssues: dto.hasSgiIssues ?? false,
            systemEvaluationNotes: dto.systemEvaluationNotes,
            personId: person.id,
          });
          const savedPatient = await manager.save(patient);
          patientId = savedPatient.id;
        } else {
          // Verify existing patient exists
          const patient = await manager.findOne(Patient, {
            where: { id: patientId },
          });
          if (!patient) {
            throw new NotFoundException(`Paciente ${patientId} no encontrado.`);
          }
        }

        // 3. Validate doctor availability (skip for walk-in with allow_overbooking)
        const shouldCheckCollision = !(
          isWalkIn && dto.allow_overbooking === true
        );
        if (shouldCheckCollision) {
          await this.validateDoctorAvailabilityWithManager(
            manager,
            dto.doctor_id,
            startTime,
            endTime,
          );
        }

        // 4. Create appointment
        const appointment = manager.create(Appointment, {
          reason: dto.reason,
          notes: dto.notes,
          statusId,
          startTime,
          endTime,
          doctorId: dto.doctor_id,
          patientId,
          isWalkIn,
        });

        return await manager.save(appointment);
      },
    );

    // Load the status relation for the response
    const appointmentWithStatus = await this.appointmentRepository.findOne({
      where: { id: savedAppointment.id },
      relations: {
        status: true,
        doctor: { person: true },
        patient: { person: true },
      },
    });

    return this.mapToCreateResponseDto(appointmentWithStatus!);
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
      .leftJoinAndSelect('appointment.status', 'status')
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
      qb.andWhere('appointment.statusId IN (:...statusIds)', {
        statusIds: query.status,
      });
    }

    const sortBy = query.sortBy ?? 'status';
    const sortOrder = query.sortOrder ?? 'ASC';
    const allowedFields = [
      'status',
      'startTime',
      'endTime',
      'createdAt',
      'updatedAt',
      'modifiedAt',
    ];
    const safeSortBy = allowedFields.includes(sortBy) ? sortBy : 'startTime';

    if (query.statusPriority) {
      const priorityIds = query.statusPriority
        .split(',')
        .map((id) => id.trim())
        .filter((id) => /^\d+$/.test(id));

      if (priorityIds.length > 0) {
        const caseExpression = priorityIds
          .map(
            (id, index) =>
              `WHEN appointment.statusId = ${id} THEN ${index + 1}`,
          )
          .join(' ');

        qb.orderBy(
          `CASE ${caseExpression} ELSE ${priorityIds.length + 1} END`,
          'ASC',
        );
      } else if (safeSortBy === 'status') {
        qb.orderBy('status.sortOrder', sortOrder);
      } else {
        qb.orderBy(`appointment.${safeSortBy}`, sortOrder);
      }
    } else if (safeSortBy === 'status') {
      qb.orderBy('status.sortOrder', sortOrder);
    } else {
      qb.orderBy(`appointment.${safeSortBy}`, sortOrder);
    }

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

  async findOne(id: number): Promise<AppointmentDetailResponseDto> {
    const getFullName = (person: {
      firstName: string;
      middleName: string | null;
      lastName: string;
    }) => {
      return [person.firstName, person.middleName, person.lastName]
        .filter(Boolean)
        .join(' ');
    };

    const appointment = await this.appointmentRepository
      .createQueryBuilder('appointment')
      .select([
        'appointment.id',
        'appointment.reason',
        'appointment.notes',
        'appointment.startTime',
        'appointment.endTime',
        'appointment.modifiedAt',
        'appointment.modificationReason',
        'appointment.isWalkIn',
      ])
      .leftJoin('appointment.doctor', 'doctor')
      .addSelect(['doctor.id'])
      .leftJoin('doctor.person', 'doctorPerson')
      .addSelect([
        'doctorPerson.firstName',
        'doctorPerson.middleName',
        'doctorPerson.lastName',
        'doctorPerson.phone',
        'doctorPerson.profilePictureUrl',
      ])
      .leftJoin('doctor.doctorSpecialtys', 'doctorSpecialty')
      .addSelect(['doctorSpecialty.id', 'doctorSpecialty.isPrimary'])
      .leftJoin('doctorSpecialty.specialty', 'specialty')
      .addSelect(['specialty.id', 'specialty.name', 'specialty.description'])
      .leftJoin('appointment.patient', 'patient')
      .addSelect([
        'patient.id',
        'patient.birthDate',
        'patient.gender',
        'patient.completeOdontogram',
      ])
      .leftJoin('patient.person', 'person')
      .addSelect([
        'person.firstName',
        'person.middleName',
        'person.lastName',
        'person.phone',
        'person.profilePictureUrl',
      ])
      .leftJoin('appointment.status', 'status')
      .addSelect([
        'status.id',
        'status.name',
        'status.color',
        'status.description',
      ])
      .where('appointment.id = :id', { id })
      .getOne();

    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found.`);
    }

    return {
      id: appointment.id,
      reason: appointment.reason,
      notes: appointment.notes,
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      modifiedAt: appointment.modifiedAt,
      modificationReason: appointment.modificationReason,
      isWalkIn: appointment.isWalkIn,
      status: {
        id: appointment.status.id,
        name: appointment.status.name,
        color: appointment.status.color,
        description: appointment.status.description,
      },
      doctor: {
        id: appointment.doctor.id,
        fullName: getFullName({
          firstName: appointment.doctor.person.firstName,
          middleName: appointment.doctor.person.middleName,
          lastName: appointment.doctor.person.lastName,
        }),
        firstName: appointment.doctor.person.firstName,
        middleName: appointment.doctor.person.middleName,
        lastName: appointment.doctor.person.lastName,
        profilePictureUrl: null,
        phone: appointment.doctor.person.phone,

        specialties: appointment.doctor.doctorSpecialtys.map(
          ({ specialty, isPrimary }) => ({
            isPrimary,
            id: specialty.id,
            name: specialty.name,
            description: specialty.description,
          }),
        ),
      },
      patient: {
        id: appointment.patient.id,
        fullName: getFullName({
          firstName: appointment.patient.person.firstName,
          middleName: appointment.patient.person.middleName,
          lastName: appointment.patient.person.lastName,
        }),
        firstName: appointment.patient.person.firstName,
        middleName: appointment.patient.person.middleName,
        lastName: appointment.patient.person.lastName,
        profilePictureUrl: null,
        phone: appointment.patient.person.phone,
        birthDate: appointment.patient.birthDate,
        gender: appointment.patient.gender,
        completeOdontogram: appointment.patient.completeOdontogram,
      },
    };
  }

  async reschedule(
    id: number,
    rescheduleDto: RescheduleAppointmentDto,
  ): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id },
      relations: {
        doctor: true,
        patient: true,
        status: true,
      },
    });

    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found.`);
    }

    if (
      appointment.status.name === STATUS.CANCELLED ||
      appointment.status.name === STATUS.COMPLETED
    ) {
      throw new BadRequestException(
        `Cannot reschedule an appointment that is already ${appointment.status.name}.`,
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
    const appointment = await this.appointmentRepository.findOne({
      where: { id },
      relations: {
        doctor: true,
        patient: true,
        status: true,
      },
    });

    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found.`);
    }

    if (
      appointment.status.name === STATUS.CANCELLED &&
      (
        await this.appointmentStatusRepository.findOne({
          where: { id: updateStatusDto.statusId },
        })
      )?.name !== STATUS.SCHEDULED
    ) {
      throw new BadRequestException(
        'Cannot modify a cancelled appointment unless rescheduled.',
      );
    }

    appointment.statusId = updateStatusDto.statusId;
    appointment.status = undefined as any;
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
      .leftJoinAndSelect('appointment.status', 'status')
      .where('appointment.doctorId = :doctorId', { doctorId })
      .andWhere('status.name NOT IN (:...cancelledStatusNames)', {
        cancelledStatusNames: [STATUS.CANCELLED],
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
      .leftJoinAndSelect('appointment.status', 'status')
      .where('appointment.doctorId = :doctorId', { doctorId })
      .andWhere('status.name NOT IN (:...cancelledStatusNames)', {
        cancelledStatusNames: [STATUS.CANCELLED],
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

  private async validateDoctorAvailabilityWithManager(
    manager: EntityManager,
    doctorId: number,
    startTime: Date,
    endTime: Date,
    excludeAppointmentId?: number,
  ): Promise<void> {
    const qb = manager
      .createQueryBuilder(Appointment, 'appointment')
      .leftJoinAndSelect('appointment.status', 'status')
      .where('appointment.doctorId = :doctorId', { doctorId })
      .andWhere('status.name NOT IN (:...cancelledStatusNames)', {
        cancelledStatusNames: [STATUS.CANCELLED],
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

    const fullName = (p: typeof patientPerson) =>
      [p?.firstName, p?.middleName, p?.lastName].filter(Boolean).join(' ');

    return {
      id: a.id,
      patientId: a.patientId,
      doctorId: a.doctorId,
      startTime: a.startTime,
      endTime: a.endTime,
      status: a.status?.name ?? 'unknown',
      reason: a.reason,
      isWalkIn: a.isWalkIn,
      patientFullName: fullName(patientPerson),
      doctorFullName: fullName(doctorPerson),
      statusColor: a.status?.color ?? 'gray',
      durationMinutes: Math.round((end.getTime() - start.getTime()) / 60000),
      rescheduled: modified !== null && start.getTime() !== created.getTime(),
      createdAt: a.createdAt,
      modifiedAt: a.modifiedAt ?? undefined,
    };
  }

  private mapToCreateResponseDto(
    appointment: Appointment,
  ): CreateAppointmentResponseDto {
    const fullName = (p: Person | undefined) =>
      [p?.firstName, p?.middleName, p?.lastName].filter(Boolean).join(' ');

    return {
      id: appointment.id,
      patientId: appointment.patientId,
      patientFullName: fullName(appointment.patient?.person),
      doctorId: appointment.doctorId,
      doctorFullName: fullName(appointment.doctor?.person),
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      status: appointment.status?.name ?? 'unknown',
      statusColor: appointment.status?.color ?? 'gray',
    };
  }

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
}
