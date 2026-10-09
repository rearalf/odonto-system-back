import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  HttpStatus,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiProduces,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { CreateDoctorDto } from '../dto/create-doctor.dto.js';
import { Doctor } from '../entities/doctor.entity.js';
import { DoctorsService } from '../services/doctors.service.js';
import { FilterDoctorDto } from '../dto/filter-doctor.dto.js';
import { UpdateDoctorDto } from '../dto/update-doctor.dto.js';
import {
  CreateDoctorSwaggerSchema,
  UpdateDoctorSwaggerSchema,
} from '../schema/doctor.schema.js';

import { PaginationHeadersInterceptor } from '../../../common/interceptors/pagination-headers.interceptor.js';
import { DoctorListItem } from '../dto/doctor-list-item.dto.js';

@ApiTags('doctors')
@Controller('doctors')
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @Get()
  @UseInterceptors(PaginationHeadersInterceptor)
  @ApiOperation({
    summary: 'Retrieve all doctors with their specialties',
    description:
      'Returns a list of all doctors with their academic qualifications and associated specialties',
  })
  @ApiResponse({
    status: 200,
    description: 'List of doctors retrieved successfully',
    type: DoctorListItem,
    isArray: true,
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
  @UseInterceptors(FileInterceptor('profilePicture'))
  @ApiOperation({
    summary: 'Create doctor',
    description:
      'Creates the person record and the doctor record in a single database transaction. The person is always created with person_type_id 4 (Doctor), so it cannot collide with an existing patient. Specialties can be attached in the same transaction. Accepts multipart/form-data, with specialties sent as a JSON string.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiProduces('application/json')
  @ApiBody({
    description:
      'Doctor creation payload including binary profile picture and qualification data',
    schema: CreateDoctorSwaggerSchema,
  })
  @ApiCreatedResponse({ type: Doctor })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      'The payload is invalid, e.g. the phone or the specialties JSON is malformed.',
  })
  create(
    @Body() dto: CreateDoctorDto,
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
  ) {
    return this.doctorsService.create(dto, profilePicture);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('profilePicture'))
  @ApiOperation({
    summary: 'Update doctor',
    description:
      'Updates the person fields, the qualification and/or the specialties of the doctor within a single transaction. When specialties is sent it replaces the whole set (at least one, exactly one marked as primary); omit it to leave them untouched. Accepts multipart/form-data.',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the doctor',
    example: 1,
  })
  @ApiConsumes('multipart/form-data')
  @ApiProduces('application/json')
  @ApiBody({
    description: 'Doctor update payload (all fields optional)',
    schema: UpdateDoctorSwaggerSchema,
  })
  @ApiOkResponse({ type: Doctor })
  @ApiNotFoundResponse({
    description: 'Doctor with the given ID does not exist.',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDoctorDto,
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
  ) {
    return this.doctorsService.update(id, dto, profilePicture);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete doctor',
    description:
      'Soft-deletes a doctor together with its person record, specialties, availability blocks and unavailability blocks.',
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
