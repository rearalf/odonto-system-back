import 'dotenv/config';
import { DataSource } from 'typeorm';
import { databaseConfig } from '../../config/database.config.js';
import { SeedRegistry } from '../entities/seed-registry.entity.js';
import { PersonTypeSeeder } from './person-type.seeder.js';

const dataSource = new DataSource({
  ...databaseConfig(),
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/migrations/*.ts'],
});

const seeders = [{ name: 'PersonTypeSeeder', runner: new PersonTypeSeeder() }];

async function seed() {
  await dataSource.initialize();
  console.log('Database connected');

  const registry = dataSource.getRepository(SeedRegistry);

  for (const { name, runner } of seeders) {
    const alreadyRun = await registry.findOne({ where: { seed_name: name } });
    if (alreadyRun) {
      console.log(`⏭ ${name} already executed, skipping`);
      continue;
    }

    await runner.run(dataSource);
    await registry.save(registry.create({ seed_name: name }));
    console.log(`✔ ${name} registered`);
  }

  console.log('Seeding completed');
  await dataSource.destroy();
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
