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

import { DoctorUnavailabilityService } from '../services/doctor-unavailability.service.js';
import { CreateDoctorUnavailabilityDto } from '../dto/create-doctor-unavailability.dto.js';
import { DoctorUnavailabilityResponseDto } from '../dto/doctor-unavailability-response.dto.js';
import { FilterDoctorUnavailabilityDto } from '../dto/filter-doctor-unavailability.dto.js';
import { UpdateDoctorUnavailabilityDto } from '../dto/update-doctor-unavailability.dto.js';

@ApiTags('doctor-unavailability')
@Controller('doctors/:doctorId/unavailability')
export class DoctorUnavailabilityController {
  constructor(
    private readonly doctorUnavailabilityService: DoctorUnavailabilityService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'List the unavailability blocks of a doctor (paginated)',
    description:
      'Returns unavailability blocks sorted by startTime. Supports pagination and date range filtering.',
  })
  @ApiParam({
    name: 'doctorId',
    description: 'Unique identifier of the doctor',
    example: 1,
  })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            $ref: '#/components/schemas/DoctorUnavailabilityResponseDto',
          },
        },
        meta: {
          type: 'object',
          nullable: true,
          properties: {
            total_count: { type: 'integer', example: 42 },
            total_pages: { type: 'integer', example: 5 },
            page: { type: 'integer', example: 1 },
            per_page: { type: 'integer', example: 10 },
          },
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Doctor with the given ID does not exist.',
  })
  @ApiBadRequestResponse({
    description: 'Invalid query parameters.',
  })
  findUnavailability(
    @Param('doctorId', ParseIntPipe) doctorId: number,
    @Query() dto: FilterDoctorUnavailabilityDto,
  ) {
    return this.doctorUnavailabilityService.findUnavailability(doctorId, dto);
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
  @ApiCreatedResponse({ type: DoctorUnavailabilityResponseDto })
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
  @ApiOkResponse({ type: DoctorUnavailabilityResponseDto })
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
    type: DoctorUnavailabilityResponseDto,
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
