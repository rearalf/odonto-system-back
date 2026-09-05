import { DataSourceOptions } from 'typeorm';

type DB_TYPE = 'postgres' | 'mysql' | 'mariadb' | 'sqlite' | 'mssql';

export const databaseConfig = (): DataSourceOptions => ({
  type: (process.env.DB_TYPE as DB_TYPE) || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_DATABASE || 'database',
  synchronize: process.env.DB_SYNCHRONIZE === 'true',
  logging: process.env.DB_LOGGING === 'true',
  entities: ['dist/**/entities/*.entity{.ts,.js}'],
  migrations: ['dist/migrations/*{.ts,.js}'],
  extra: {
    ssl:
      process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: true }
        : undefined,
  },
});
