import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { CreateDoctorSpecialtyDto } from '../dto/create-doctor-specialty.dto.js';
import { DoctorSpecialtiesService } from '../services/doctor-specialties.service.js';
import { DoctorSpecialty } from '../entities/doctor-specialty.entity.js';
import { FilterDoctorSpecialtyDto } from '../dto/filter-doctor-specialty.dto.js';
import { UpdateDoctorSpecialtyDto } from '../dto/update-doctor-specialty.dto.js';

import { PaginationHeadersInterceptor } from '../../../common/interceptors/pagination-headers.interceptor.js';

@ApiTags('doctor-specialties')
@Controller('doctors/:doctorId/specialties')
export class DoctorSpecialtiesController {
  constructor(
    private readonly doctorSpecialtiesService: DoctorSpecialtiesService,
  ) {}

  @Get()
  @UseInterceptors(PaginationHeadersInterceptor)
  @ApiOperation({
    summary: 'List the specialties of a doctor',
    description:
      'Returns the specialties of the doctor, main specialty first, optionally filtered by specialty name.',
  })
  @ApiParam({
    name: 'doctorId',
    description: 'Unique identifier of the doctor',
    example: 1,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of specialties returned successfully.',
  })
  findSpecialties(
    @Param('doctorId', ParseIntPipe) doctorId: number,
    @Query() filterDoctorSpecialtyDto: FilterDoctorSpecialtyDto,
  ) {
    return this.doctorSpecialtiesService.findSpecialties(
      doctorId,
      filterDoctorSpecialtyDto,
    );
  }

  @Post()
  @ApiOperation({
    summary: 'Add a specialty to a doctor',
    description:
      'Attaches a specialty to the doctor. A specialty cannot be attached twice and, when marked as primary, the previous primary specialty is demoted automatically.',
  })
  @ApiParam({
    name: 'doctorId',
    description: 'Unique identifier of the doctor',
    example: 1,
  })
  @ApiBody({ type: CreateDoctorSpecialtyDto })
  @ApiCreatedResponse({ type: DoctorSpecialty })
  @ApiNotFoundResponse({
    description: 'Doctor or specialty does not exist.',
  })
  @ApiConflictResponse({
    description: 'The doctor already has that specialty registered.',
  })
  addSpecialty(
    @Param('doctorId', ParseIntPipe) doctorId: number,
    @Body() dto: CreateDoctorSpecialtyDto,
  ) {
    return this.doctorSpecialtiesService.addSpecialty(doctorId, dto);
  }

  @Patch(':specialtyId')
  @ApiOperation({
    summary: 'Update a specialty of a doctor',
    description:
      'Replaces the attached specialty and/or marks it as the main one, demoting the previous primary specialty.',
  })
  @ApiParam({
    name: 'doctorId',
    description: 'Unique identifier of the doctor',
    example: 1,
  })
  @ApiParam({
    name: 'specialtyId',
    description: 'Identifier of the doctor_specialty row',
    example: 1,
  })
  @ApiBody({ type: UpdateDoctorSpecialtyDto })
  @ApiOkResponse({ type: DoctorSpecialty })
  @ApiNotFoundResponse({
    description: 'The row is not registered for this doctor.',
  })
  @ApiConflictResponse({
    description: 'The doctor already has that specialty registered.',
  })
  updateSpecialty(
    @Param('doctorId', ParseIntPipe) doctorId: number,
    @Param('specialtyId', ParseIntPipe) specialtyId: number,
    @Body() dto: UpdateDoctorSpecialtyDto,
  ) {
    return this.doctorSpecialtiesService.updateSpecialty(
      doctorId,
      specialtyId,
      dto,
    );
  }

  @Delete(':specialtyId')
  @ApiOperation({
    summary: 'Remove a specialty from a doctor',
    description: 'Soft-deletes the link between the doctor and the specialty.',
  })
  @ApiParam({
    name: 'doctorId',
    description: 'Unique identifier of the doctor',
    example: 1,
  })
  @ApiParam({
    name: 'specialtyId',
    description: 'Identifier of the doctor_specialty row',
    example: 1,
  })
  @ApiOkResponse({ description: 'Specialty removed successfully.' })
  @ApiNotFoundResponse({
    description: 'The row is not registered for this doctor.',
  })
  removeSpecialty(
    @Param('doctorId', ParseIntPipe) doctorId: number,
    @Param('specialtyId', ParseIntPipe) specialtyId: number,
  ) {
    return this.doctorSpecialtiesService.removeSpecialty(doctorId, specialtyId);
  }
}
