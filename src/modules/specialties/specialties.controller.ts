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

import { SpecialtiesService } from './specialties.service.js';
import { Specialty } from './entities/specialty.entity.js';
import { CreateSpecialtyDto } from './dto/create-specialty.dto.js';
import { UpdateSpecialtyDto } from './dto/update-specialty.dto.js';
import { FilterSpecialtyDto } from './dto/filter-specialty.dto.js';
import { PaginationHeadersInterceptor } from '../../common/interceptors/pagination-headers.interceptor.js';

@ApiTags('specialties')
@Controller('specialties')
export class SpecialtiesController {
  constructor(private readonly specialtiesService: SpecialtiesService) {}

  @Get()
  @UseInterceptors(PaginationHeadersInterceptor)
  @ApiOperation({
    summary: 'List all specialties',
    description:
      'Returns the active specialties sorted alphabetically, optionally filtered by name. Soft-deleted records are excluded. Designed to feed selects and autocomplete inputs.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of specialties returned successfully.',
  })
  findAll(@Query() filterSpecialtyDto: FilterSpecialtyDto) {
    return this.specialtiesService.findAll(filterSpecialtyDto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get specialty by ID',
    description:
      'Returns a single specialty by its ID. Throws 404 if not found.',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the specialty',
    example: 1,
  })
  @ApiOkResponse({ type: Specialty })
  @ApiNotFoundResponse({
    description: 'Specialty with the given ID does not exist.',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.specialtiesService.findOne(id);
  }

  @Post()
  @ApiOperation({
    summary: 'Create specialty',
    description:
      'Creates a specialty. The name must be unique across active and soft-deleted records, ignoring case and accents.',
  })
  @ApiBody({ type: CreateSpecialtyDto })
  @ApiCreatedResponse({ type: Specialty })
  @ApiConflictResponse({
    description: 'A specialty with the same name already exists.',
  })
  create(@Body() dto: CreateSpecialtyDto) {
    return this.specialtiesService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update specialty',
    description: 'Updates the name and/or description of a specialty.',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the specialty',
    example: 1,
  })
  @ApiBody({ type: UpdateSpecialtyDto })
  @ApiOkResponse({ type: Specialty })
  @ApiNotFoundResponse({
    description: 'Specialty with the given ID does not exist.',
  })
  @ApiConflictResponse({
    description: 'Another specialty already uses the requested name.',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSpecialtyDto,
  ) {
    return this.specialtiesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete specialty',
    description: 'Soft-deletes a specialty. The name remains reserved.',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the specialty',
    example: 1,
  })
  @ApiOkResponse({ description: 'Specialty deleted successfully.' })
  @ApiNotFoundResponse({
    description: 'Specialty with the given ID does not exist.',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.specialtiesService.remove(id);
  }
}
