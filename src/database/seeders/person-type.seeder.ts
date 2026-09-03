import { DataSource } from 'typeorm';
import { PersonType } from '../../modules/person-types/entities/person-type.entity.js';
import { Seeder } from './seeder.interface.js';

const PERSON_TYPES = [
  {
    id: 1,
    name: 'Administrador',
    description: 'Persona con permisos administrativos generales.',
  },
  {
    id: 2,
    name: 'Recepcionista',
    description: 'Persona que agenda citas y gestiona la clínica.',
  },
  {
    id: 3,
    name: 'Asistente Dental',
    description: 'Persona que asiste al profesional de salud.',
  },
  {
    id: 4,
    name: 'Doctor',
    description: 'Profesional de la salud que atiende a los pacientes.',
  },
  {
    id: 5,
    name: 'Paciente',
    description: 'Persona que recibe tratamiento en la clínica.',
  },
];

export class PersonTypeSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const repo = dataSource.getRepository(PersonType);

    for (const data of PERSON_TYPES) {
      await repo.save(repo.create(data));
      console.log(`  + ${data.name}`);
    }
  }
}
