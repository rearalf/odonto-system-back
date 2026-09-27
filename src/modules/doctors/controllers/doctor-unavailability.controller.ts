import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
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

import { CreateDoctorUnavailabilityDto } from '../dto/create-doctor-unavailability.dto.js';
import { DoctorUnavailability } from '../entities/doctor-unavailability.entity.js';
import { DoctorUnavailabilityService } from '../services/doctor-unavailability.service.js';
import { UpdateDoctorUnavailabilityDto } from '../dto/update-doctor-unavailability.dto.js';

@ApiTags('doctor-unavailability')
@Controller('doctors/:doctorId/unavailability')
export class DoctorUnavailabilityController {
  constructor(
    private readonly doctorUnavailabilityService: DoctorUnavailabilityService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'List the unavailability blocks of a doctor',
    description:
      'Returns every active unavailability block of the doctor sorted by start instant, without pagination.',
  })
  @ApiParam({
    name: 'doctorId',
    description: 'Unique identifier of the doctor',
    example: 1,
  })
  @ApiOkResponse({ type: [DoctorUnavailability] })
  @ApiNotFoundResponse({
    description: 'Doctor with the given ID does not exist.',
  })
  findUnavailability(@Param('doctorId', ParseIntPipe) doctorId: number) {
    return this.doctorUnavailabilityService.findUnavailability(doctorId);
  }

  @Post()
  @ApiOperation({
    summary: 'Add an unavailability block to a doctor',
    description:
      'Registers a period in which the doctor cannot be booked. Blocks overlapping another unavailability of the same doctor are rejected.',
  })
  @ApiParam({
    name: 'doctorId',
    description: 'Unique identifier of the doctor',
    example: 1,
  })
  @ApiBody({ type: CreateDoctorUnavailabilityDto })
  @ApiCreatedResponse({ type: DoctorUnavailability })
  @ApiNotFoundResponse({
    description: 'Doctor with the given ID does not exist.',
  })
  @ApiBadRequestResponse({
    description: 'The end instant is not after the start instant.',
  })
  @ApiConflictResponse({
    description:
      'The block overlaps another unavailability already registered.',
  })
  addUnavailability(
    @Param('doctorId', ParseIntPipe) doctorId: number,
    @Body() dto: CreateDoctorUnavailabilityDto,
  ) {
    return this.doctorUnavailabilityService.addUnavailability(doctorId, dto);
  }

  @Patch(':unavailabilityId')
  @ApiOperation({
    summary: 'Update an unavailability block of a doctor',
    description:
      'Updates the interval and/or the reason, revalidating the range and the overlap against the other blocks of the doctor.',
  })
  @ApiParam({
    name: 'doctorId',
    description: 'Unique identifier of the doctor',
    example: 1,
  })
  @ApiParam({
    name: 'unavailabilityId',
    description: 'Identifier of the doctor_unavailability row',
    example: 1,
  })
  @ApiBody({ type: UpdateDoctorUnavailabilityDto })
  @ApiOkResponse({ type: DoctorUnavailability })
  @ApiNotFoundResponse({
    description: 'The row is not registered for this doctor.',
  })
  @ApiConflictResponse({
    description:
      'The block overlaps another unavailability already registered.',
  })
  updateUnavailability(
    @Param('doctorId', ParseIntPipe) doctorId: number,
    @Param('unavailabilityId', ParseIntPipe) unavailabilityId: number,
    @Body() dto: UpdateDoctorUnavailabilityDto,
  ) {
    return this.doctorUnavailabilityService.updateUnavailability(
      doctorId,
      unavailabilityId,
      dto,
    );
  }

  @Delete(':unavailabilityId')
  @ApiOperation({
    summary: 'Remove an unavailability block of a doctor',
    description: 'Soft-deletes an unavailability block.',
  })
  @ApiParam({
    name: 'doctorId',
    description: 'Unique identifier of the doctor',
    example: 1,
  })
  @ApiParam({
    name: 'unavailabilityId',
    description: 'Identifier of the doctor_unavailability row',
    example: 1,
  })
  @ApiOkResponse({
    description: 'Unavailability block deleted successfully.',
  })
  @ApiNotFoundResponse({
    description: 'The row is not registered for this doctor.',
  })
  removeUnavailability(
    @Param('doctorId', ParseIntPipe) doctorId: number,
    @Param('unavailabilityId', ParseIntPipe) unavailabilityId: number,
  ) {
    return this.doctorUnavailabilityService.removeUnavailability(
      doctorId,
      unavailabilityId,
    );
  }
}
