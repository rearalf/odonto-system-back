import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PersonType } from './entities/person-type.entity.js';

@Injectable()
export class PersonTypesService {
  constructor(
    @InjectRepository(PersonType)
    private readonly personTypeRepository: Repository<PersonType>,
  ) {}

  findAll(): Promise<PersonType[]> {
    return this.personTypeRepository.find();
  }

  findOne(id: number): Promise<PersonType | null> {
    return this.personTypeRepository.findOneBy({ id });
  }
}
