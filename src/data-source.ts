import 'dotenv/config';
import { DataSource } from 'typeorm';
import { databaseConfig } from './config/database.config.js';

export default new DataSource({
  ...databaseConfig(),
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/migrations/*.ts'],
});
