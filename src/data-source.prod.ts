import 'dotenv/config';
import { DataSource } from 'typeorm';
import { databaseConfig } from './config/database.config.js';

export default new DataSource({
  ...databaseConfig(),
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: ['dist/migrations/*{.ts,.js}'],
});
