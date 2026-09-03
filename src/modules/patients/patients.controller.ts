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
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiProduces,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PatientsService } from './patients.service.js';
import { CreatePatientDto } from './dto/create-patient.dto.js';
import { UpdatePatientDto } from './dto/update-patient.dto.js';
import { CreatePatientSwaggerSchema } from './schema/create-patient.schema.js';

@ApiTags('patients')
@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Get()
  findAll() {
    return this.patientsService.findAll();
  }

  @Get(':id')
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
    @UploadedFile() profilePicture?: Express.Multer.File,
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
