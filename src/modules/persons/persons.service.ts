import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Person } from './entities/person.entity.js';
import { CreatePersonDto } from './dto/create-person.dto.js';
import { UpdatePersonDto } from './dto/update-person.dto.js';

@Injectable()
export class PersonsService {
  constructor(
    @InjectRepository(Person)
    private readonly personRepository: Repository<Person>,
  ) {}

  findAll(): Promise<Person[]> {
    return this.personRepository.find({ relations: ['personType'] });
  }

  async findOne(id: number): Promise<Person> {
    const person = await this.personRepository.findOne({
      where: { id },
      relations: ['personType'],
    });
    if (!person) {
      throw new NotFoundException(`Person with id ${id} not found`);
    }
    return person;
  }

  create(dto: CreatePersonDto): Promise<Person> {
    const person = this.personRepository.create(dto);
    return this.personRepository.save(person);
  }

  async update(id: number, dto: UpdatePersonDto): Promise<Person> {
    await this.findOne(id);
    await this.personRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.personRepository.softDelete(id);
  }
}
