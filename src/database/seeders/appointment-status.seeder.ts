import { DataSource } from 'typeorm';
import { AppointmentStatus } from '../../modules/appointments/entities/appointment-status.entity.js';
import { Seeder } from './seeder.interface.js';

const APPOINTMENT_STATUSES = [
  {
    id: 1,
    name: 'scheduled',
    color: '#0ea5e9',
    description: 'Cita programada',
    sortOrder: 1,
  },
  {
    id: 2,
    name: 'confirmed',
    color: '#10b981',
    description: 'Cita confirmada',
    sortOrder: 2,
  },
  {
    id: 3,
    name: 'waiting',
    color: '#f59e0b',
    description: 'Paciente en sala de espera',
    sortOrder: 3,
  },
  {
    id: 4,
    name: 'in_progress',
    color: '#8b5cf6',
    description: 'Cita en curso',
    sortOrder: 4,
  },
  {
    id: 5,
    name: 'completed',
    color: '#059669',
    description: 'Cita completada',
    sortOrder: 5,
  },
  {
    id: 6,
    name: 'cancelled',
    color: '#ef4444',
    description: 'Cita cancelada',
    sortOrder: 6,
  },
  {
    id: 7,
    name: 'no_show',
    color: '#64748b',
    description: 'Paciente no asistió',
    sortOrder: 7,
  },
  {
    id: 8,
    name: 'rejected',
    color: '#f97316',
    description: 'Cita rechazada',
    sortOrder: 8,
  },
];

export class AppointmentStatusSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const repo = dataSource.getRepository(AppointmentStatus);

    for (const data of APPOINTMENT_STATUSES) {
      await repo.save(repo.create(data));
      console.log(`  + ${data.name}`);
    }

    await dataSource.query(
      `SELECT setval('appointment_status_id_seq', (SELECT MAX(id) FROM "appointment_status"))`,
    );
  }
}
