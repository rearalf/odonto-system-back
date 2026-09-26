import {
  Get,
  Param,
  Controller,
  ParseIntPipe,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { PersonTypesService } from './person-types.service.js';

@ApiTags('person-types')
@Controller('person-types')
export class PersonTypesController {
  constructor(private readonly personTypesService: PersonTypesService) {}

  @Get()
  findAll() {
    return this.personTypesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const personType = await this.personTypesService.findOne(id);
    if (!personType) {
      throw new NotFoundException(`Person type with id ${id} not found`);
    }
    return personType;
  }
}
