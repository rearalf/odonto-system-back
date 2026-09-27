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
  ApiBadRequestResponse,
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

import { CreateDoctorDto } from '../dto/create-doctor.dto.js';
import { Doctor } from '../entities/doctor.entity.js';
import { DoctorsService } from '../services/doctors.service.js';
import { FilterDoctorDto } from '../dto/filter-doctor.dto.js';
import { UpdateDoctorDto } from '../dto/update-doctor.dto.js';

import { PaginationHeadersInterceptor } from '../../../common/interceptors/pagination-headers.interceptor.js';

@ApiTags('doctors')
@Controller('doctors')
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @Get()
  @UseInterceptors(PaginationHeadersInterceptor)
  @ApiOperation({
    summary: 'List all doctors',
    description:
      'Returns the active doctors with their person record, sorted by last name. Optionally filtered by the first, middle or last name, ignoring case and accents. Soft-deleted records are excluded.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of doctors returned successfully.',
  })
  findAll(@Query() filterDoctorDto: FilterDoctorDto) {
    return this.doctorsService.findAll(filterDoctorDto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get doctor by ID',
    description:
      'Returns a single doctor with its person record, person type and specialties. Throws 404 if not found.',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the doctor',
    example: 1,
  })
  @ApiOkResponse({ type: Doctor })
  @ApiNotFoundResponse({
    description: 'Doctor with the given ID does not exist.',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.doctorsService.findOne(id);
  }

  @Post()
  @ApiOperation({
    summary: 'Create doctor',
    description:
      'Creates a doctor attached to an existing person. The person must have person_type_id 4 (Doctor) and must not be registered as patient. Specialties can be attached in the same transaction.',
  })
  @ApiBody({ type: CreateDoctorDto })
  @ApiCreatedResponse({ type: Doctor })
  @ApiBadRequestResponse({
    description: 'The person exists but is not registered as a doctor.',
  })
  @ApiNotFoundResponse({
    description: 'The referenced person does not exist.',
  })
  @ApiConflictResponse({
    description:
      'The person is already registered as a doctor or as a patient, or a specialty is repeated.',
  })
  create(@Body() dto: CreateDoctorDto) {
    return this.doctorsService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update doctor',
    description:
      'Updates the qualification and/or the person behind the doctor. Changing the person re-runs the validations applied on creation.',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the doctor',
    example: 1,
  })
  @ApiBody({ type: UpdateDoctorDto })
  @ApiOkResponse({ type: Doctor })
  @ApiNotFoundResponse({
    description: 'Doctor with the given ID does not exist.',
  })
  @ApiConflictResponse({
    description:
      'The person is already registered as a doctor or as a patient.',
  })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateDoctorDto) {
    return this.doctorsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete doctor',
    description:
      'Soft-deletes a doctor together with its specialties, availability blocks and unavailability blocks.',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the doctor',
    example: 1,
  })
  @ApiOkResponse({ description: 'Doctor deleted successfully.' })
  @ApiNotFoundResponse({
    description: 'Doctor with the given ID does not exist.',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.doctorsService.remove(id);
  }
}
