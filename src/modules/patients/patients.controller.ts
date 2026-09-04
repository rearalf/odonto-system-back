import {
  Body,
  ClassSerializerInterceptor,
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
  ApiOperation,
  ApiParam,
  ApiProduces,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { PatientsService } from './patients.service.js';

import { CreatePatientDto } from './dto/create-patient.dto.js';
import { UpdatePatientDto } from './dto/update-patient.dto.js';
import { FilterPatientDto } from './dto/filter-patient.dto.js';
import { PatientResponseDto } from './dto/patient-response.dto.js';

import { CreatePatientSwaggerSchema } from './schema/create-patient.schema.js';
import { PaginationHeadersInterceptor } from '../../common/interceptors/pagination-headers.interceptor.js';

@ApiTags('patients')
@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Get()
  @UseInterceptors(PaginationHeadersInterceptor)
  @ApiOperation({
    summary: 'List all patients',
    description:
      'Returns all active patients with their associated person and person type data. Soft-deleted records are excluded.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of patients returned successfully.',
  })
  findAll(@Query() filterPatientDto: FilterPatientDto) {
    return this.patientsService.findAll(filterPatientDto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get patient by ID',
    description:
      'Returns a single patient by its ID, including associated person and person type data. Throws 404 if not found.',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the patient',
    example: 1,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Patient found and returned successfully.',
    type: PatientResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Patient with the given ID does not exist.',
  })
  @UseInterceptors(ClassSerializerInterceptor)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.patientsService.findOne(id);
  }

  @Post()
  @UseInterceptors(FileInterceptor('profilePicture'))
  @ApiOperation({
    summary: 'Create patient',
    description:
      'Creates a person record and an associated patient record in a single database transaction. Person-related fields (firstName, lastName, etc.) are used to create the person entity, while the remaining fields populate the patient entity.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiProduces('application/json')
  @ApiBody({
    description:
      'Patient creation payload including binary avatar and clinical data',
    schema: CreatePatientSwaggerSchema,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Patient and person records created successfully.',
  })
  create(
    @Body() dto: CreatePatientDto,
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
    return this.patientsService.create(dto, profilePicture);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePatientDto) {
    return this.patientsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.patientsService.remove(id);
  }
}
