import {
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  HttpCode,
  Controller,
  HttpStatus,
  UploadedFile,
  ParseIntPipe,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiBody,
  ApiParam,
  ApiConsumes,
  ApiResponse,
  ApiOperation,
  ApiNotFoundResponse,
  ApiConflictResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { CreateAppointmentWithPatientDto } from './dto/create-appointment-with-patient.dto.js';
import { CreateAppointmentResponseDto } from './dto/create-appointment-response.dto.js';
import { Appointment } from './entities/appointment.entity.js';
import { QueryAppointmentsDto } from './dto/query-appointments.dto.js';
import { AvailableSlotDto } from './dto/available-slot.dto.js';
import { AvailableSlotsQueryDto } from './dto/available-slots-query.dto.js';
import { UpdateAppointmentStatusDto } from './dto/update-appointment-status.dto.js';
import { RescheduleAppointmentDto } from './dto/reschedule-appointment.dto.js';
import { PaginationMeta } from '../../common/helpers/pagination-helper.js';
import { AppointmentsService } from './appointments.service.js';
import {
  AppointmentListDto,
  PaginatedAppointmentsResponseDto,
} from './dto/appointment-list.dto.js';
import { AppointmentStatusDto } from './dto/appointment-status.dto.js';
import {
  ParseFilePipe,
  FileTypeValidator,
  MaxFileSizeValidator,
} from '@nestjs/common';

@ApiTags('Appointments')
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('profilePicture'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Schedule a new appointment (with optional patient creation)',
    description:
      'Creates an appointment record linking a doctor and a patient. If patient_id is not provided, ' +
      'creates a new patient (person + patient) in the same transaction. ' +
      'Accepts multipart/form-data for optional profile picture upload.',
  })
  @ApiBody({
    description:
      'Appointment creation payload with optional patient data and binary avatar',
    type: CreateAppointmentWithPatientDto,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Appointment scheduled successfully.',
    type: CreateAppointmentResponseDto,
  })
  @ApiBadRequestResponse({
    description:
      'Validation failed on input payloads or dates, or required patient fields missing.',
  })
  @ApiConflictResponse({
    description: 'The selected doctor has a scheduling overlap.',
  })
  async create(
    @Body() dto: CreateAppointmentWithPatientDto,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: false,
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }),
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ }),
        ],
      }),
    )
    profilePicture?: Express.Multer.File,
  ): Promise<CreateAppointmentResponseDto> {
    return this.appointmentsService.create(dto, profilePicture);
  }

  @Get()
  @ApiOperation({
    summary: 'Retrieve calendar / agenda appointments',
    description:
      'Fetches a filtered list of appointments by doctor ID and date boundaries for calendar visualization. ' +
      'Supports optional pagination (enabled by default) and multiple filter criteria.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of matching appointments retrieved successfully.',
    type: PaginatedAppointmentsResponseDto,
  })
  async findAll(
    @Query() query: QueryAppointmentsDto,
  ): Promise<{ data: AppointmentListDto[]; meta: PaginationMeta | null }> {
    return this.appointmentsService.findAll(query);
  }

  @Get('statuses')
  @ApiOperation({
    summary: 'Get all available appointment statuses',
    description:
      'Returns a list of all active appointment statuses with their IDs, names, colors, and descriptions. ' +
      'Use this endpoint to populate status dropdowns in the frontend. ' +
      'The `statusId` from this response should be used when creating or updating appointments.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description:
      'List of active appointment statuses ordered by display order.',
    type: [AppointmentStatusDto],
  })
  async getStatuses(): Promise<AppointmentStatusDto[]> {
    return this.appointmentsService.getStatuses();
  }

  @Get('doctor/:id/available-slots')
  @ApiOperation({
    summary: 'Calculate available appointment slots for a doctor',
    description:
      'Computes unbooked working time slots for a specific doctor on a selected target date.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Unique identifier of the doctor',
    example: 1,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Calculated available slots returned successfully.',
    type: [AvailableSlotDto],
  })
  @ApiNotFoundResponse({
    description: 'Doctor not found or inactive schedule.',
  })
  async getDoctorAvailableSlots(
    @Param('id', ParseIntPipe) doctorId: number,
    @Query() query: AvailableSlotsQueryDto,
  ): Promise<AvailableSlotDto[]> {
    return this.appointmentsService.getDoctorAvailableSlots(doctorId, query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get appointment details by ID',
    description:
      'Fetches full metadata and relation details for a single medical appointment.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Unique identifier of the appointment',
    example: 101,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Appointment details retrieved successfully.',
    type: Appointment,
  })
  @ApiNotFoundResponse({
    description: 'No appointment found matching the provided ID.',
  })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Appointment> {
    return this.appointmentsService.findOne(id);
  }

  @Patch(':id/reschedule')
  @ApiOperation({
    summary: 'Reschedule an existing appointment',
    description:
      'Updates start and end timestamps, populating modification audit details.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Unique identifier of the appointment to reschedule',
    example: 101,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Appointment successfully rescheduled.',
    type: Appointment,
  })
  @ApiBadRequestResponse({
    description: 'Invalid timestamps or end_time precedes start_time.',
  })
  @ApiConflictResponse({
    description: 'New slot collides with an existing doctor booking.',
  })
  @ApiNotFoundResponse({
    description: 'Appointment not found.',
  })
  async reschedule(
    @Param('id', ParseIntPipe) id: number,
    @Body() rescheduleDto: RescheduleAppointmentDto,
  ): Promise<Appointment> {
    return this.appointmentsService.reschedule(id, rescheduleDto);
  }

  @Patch(':id/status')
  @ApiOperation({
    summary: 'Advance appointment lifecycle status',
    description:
      'Transitions the appointment status (e.g., from scheduled to confirmed, completed, or cancelled).',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Unique identifier of the appointment',
    example: 101,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Appointment status transitioned successfully.',
    type: Appointment,
  })
  @ApiBadRequestResponse({
    description: 'Supplied status transition is illegal or invalid.',
  })
  @ApiNotFoundResponse({
    description: 'Appointment not found.',
  })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStatusDto: UpdateAppointmentStatusDto,
  ): Promise<Appointment> {
    return this.appointmentsService.updateStatus(id, updateStatusDto);
  }
}
