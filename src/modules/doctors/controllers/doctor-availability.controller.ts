import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { AvailableSlotsDto } from '../dto/available-slots.dto.js';
import { CreateDoctorAvailabilityDto } from '../dto/create-doctor-availability.dto.js';
import { DoctorAvailabilityService } from '../services/doctor-availability.service.js';
import { DoctorAvailability } from '../entities/doctor-availability.entity.js';
import { UpdateDoctorAvailabilityDto } from '../dto/update-doctor-availability.dto.js';

@ApiTags('doctor-availability')
@Controller('doctors/:doctorId')
export class DoctorAvailabilityController {
  constructor(
    private readonly doctorAvailabilityService: DoctorAvailabilityService,
  ) {}

  @Get('available-slots')
  @ApiOperation({
    summary: 'Get the free slots of a doctor for a given date',
    description:
      'Computes the bookable slots of the given date from the availability blocks that apply to it: the recurring blocks whose day_of_week matches plus the blocks tied to that exact specific_date. Slots already elapsed and slots covered by an unavailability are omitted. Past dates are rejected.',
  })
  @ApiParam({
    name: 'doctorId',
    description: 'Unique identifier of the doctor',
    example: 1,
  })
  @ApiOkResponse({
    description: 'Free slots of the requested date.',
  })
  @ApiNotFoundResponse({
    description: 'Doctor with the given ID does not exist.',
  })
  @ApiBadRequestResponse({
    description: 'The date is malformed or belongs to the past.',
  })
  availableSlots(
    @Param('doctorId', ParseIntPipe) doctorId: number,
    @Query() dto: AvailableSlotsDto,
  ) {
    return this.doctorAvailabilityService.availableSlots(doctorId, dto);
  }

  @Get('availability')
  @ApiOperation({
    summary: 'List the availability blocks of a doctor',
    description:
      'Returns every active availability block of the doctor, recurring blocks and date specific blocks, without pagination.',
  })
  @ApiParam({
    name: 'doctorId',
    description: 'Unique identifier of the doctor',
    example: 1,
  })
  @ApiOkResponse({ type: [DoctorAvailability] })
  @ApiNotFoundResponse({
    description: 'Doctor with the given ID does not exist.',
  })
  findAvailability(@Param('doctorId', ParseIntPipe) doctorId: number) {
    return this.doctorAvailabilityService.findAvailability(doctorId);
  }

  @Post('availability')
  @ApiOperation({
    summary: 'Add an availability block to a doctor',
    description:
      'Creates an attention block. Recurring blocks require day_of_week and forbid specific_date, non recurring blocks require specific_date and forbid day_of_week. Blocks that overlap another block of the same day are rejected.',
  })
  @ApiParam({
    name: 'doctorId',
    description: 'Unique identifier of the doctor',
    example: 1,
  })
  @ApiBody({ type: CreateDoctorAvailabilityDto })
  @ApiCreatedResponse({ type: DoctorAvailability })
  @ApiNotFoundResponse({
    description: 'Doctor with the given ID does not exist.',
  })
  @ApiBadRequestResponse({
    description:
      'The block mixes recurring and date specific fields, misses one of them, or the end time is not after the start time.',
  })
  @ApiConflictResponse({
    description: 'The block overlaps another block already registered.',
  })
  addAvailability(
    @Param('doctorId', ParseIntPipe) doctorId: number,
    @Body() dto: CreateDoctorAvailabilityDto,
  ) {
    return this.doctorAvailabilityService.addAvailability(doctorId, dto);
  }

  @Patch('availability/:availabilityId')
  @ApiOperation({
    summary: 'Update an availability block of a doctor',
    description:
      'Updates the block and revalidates the recurring/date specific combination and the overlap against the other blocks of the doctor.',
  })
  @ApiParam({
    name: 'doctorId',
    description: 'Unique identifier of the doctor',
    example: 1,
  })
  @ApiParam({
    name: 'availabilityId',
    description: 'Identifier of the doctor_availability row',
    example: 1,
  })
  @ApiBody({ type: UpdateDoctorAvailabilityDto })
  @ApiOkResponse({ type: DoctorAvailability })
  @ApiNotFoundResponse({
    description: 'The row is not registered for this doctor.',
  })
  @ApiConflictResponse({
    description: 'The block overlaps another block already registered.',
  })
  updateAvailability(
    @Param('doctorId', ParseIntPipe) doctorId: number,
    @Param('availabilityId', ParseIntPipe) availabilityId: number,
    @Body() dto: UpdateDoctorAvailabilityDto,
  ) {
    return this.doctorAvailabilityService.updateAvailability(
      doctorId,
      availabilityId,
      dto,
    );
  }

  @Delete('availability/:availabilityId')
  @ApiOperation({
    summary: 'Remove an availability block of a doctor',
    description: 'Soft-deletes an attention block.',
  })
  @ApiParam({
    name: 'doctorId',
    description: 'Unique identifier of the doctor',
    example: 1,
  })
  @ApiParam({
    name: 'availabilityId',
    description: 'Identifier of the doctor_availability row',
    example: 1,
  })
  @ApiOkResponse({ description: 'Availability block deleted successfully.' })
  @ApiNotFoundResponse({
    description: 'The row is not registered for this doctor.',
  })
  removeAvailability(
    @Param('doctorId', ParseIntPipe) doctorId: number,
    @Param('availabilityId', ParseIntPipe) availabilityId: number,
  ) {
    return this.doctorAvailabilityService.removeAvailability(
      doctorId,
      availabilityId,
    );
  }
}
