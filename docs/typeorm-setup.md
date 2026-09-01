# TypeORM + PostgreSQL — Instalación, Configuración y Migraciones

## 1. Dependencias

```bash
# Runtime
npm install @nestjs/typeorm typeorm pg

# Configuración de variables de entorno
npm install @nestjs/config

# Dev — solo para ejecutar CLI de migraciones
npm install -D typeorm
```

> `pg` es el driver nativo de PostgreSQL para Node.js. Sin él, TypeORM no puede conectarse.

---

## 2. Variables de entorno

Crear el archivo `.env` en la raíz del proyecto:

```env
# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=odonto_system

# App
PORT=3000

# TypeORM
DB_SYNCHRONIZE=false
DB_LOGGING=true
```

> **`DB_SYNCHRONIZE=false` en producción.** Sincronizar schemas automáticamente en prod borra datos. Solo `true` en desarrollo.

### Tipado de variables de entorno (opcional pero recomendado)

Crear `src/config/env.validation.ts`:

```typescript
import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsString,
  Max,
  Min,
  validateSync,
} from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsInt()
  @Min(1)
  @Max(65535)
  PORT: number;

  @IsString()
  DB_HOST: string;

  @IsInt()
  @Min(1)
  @Max(65535)
  DB_PORT: number;

  @IsString()
  DB_USERNAME: string;

  @IsString()
  DB_PASSWORD: string;

  @IsString()
  DB_DATABASE: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
}
```

---

## 3. Configuración del módulo

### `src/config/database.config.ts`

```typescript
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const databaseConfig = (): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  autoLoadEntities: true,
  synchronize: process.env.DB_SYNCHRONIZE === 'true',
  logging: process.env.DB_LOGGING === 'true',
});
```

### `src/app.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { validate } from './config/env.validation.js';
import { databaseConfig } from './config/database.config.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: () => databaseConfig(),
    }),
    // TypeOrmModule.forFeature([...]) aquí o en módulos feature
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

> `autoLoadEntities: true` hace que TypeORM registre automáticamente las entidades que se agregan con `TypeOrmModule.forFeature()` en cada módulo. No necesitas listarlas todas en un array centralizado.

---

## 4. Data Source para migraciones

TypeORM CLI necesita un `DataSource` independiente del contexto de NestJS. Crear `src/data-source.ts`:

```typescript
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
});
```

> Este archivo se usa **exclusivamente** para el CLI de TypeORM desde la terminal. NestJS no lo importa en runtime.

---

## 5. Scripts en `package.json`

Agregar al bloque `"scripts"`:

```json
{
  "migration:generate": "typeorm-ts-node-esm migration:generate src/migrations/MigrationName -d src/data-source.ts",
  "migration:run": "typeorm-ts-node-esm migration:run -d src/data-source.ts",
  "migration:revert": "typeorm-ts-node-esm migration:revert -d src/data-source.ts"
}
```

### Flags de ESM

El proyecto usa `"type": "module"`, por eso `typeorm-ts-node-esm` en lugar de `typeorm-ts-node-commonjs`. Esto es obligatorio — si usas el prefijo `commonjs`, TypeScript lanza error de resolución de módulos.

---

## 6. Workflow de migraciones

### Generar una migración

```bash
npm run migration:generate -- src/migrations/CreatePatientsTable
```

Esto compara las entidades actuales contra la base de datos y genera el archivo SQL necesario en `src/migrations/`. El nombre del archivo se pasa como argumento.

### Revisar el archivo generado

TypeORM crea algo como:

```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePatientsTable1693000000000 implements MigrationInterface {
  name = 'CreatePatientsTable1693000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "patient" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "email" character varying NOT NULL,
        CONSTRAINT "PK_patient" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "patient"`);
  }
}
```

**Siempre revisa el SQL generado** antes de ejecutarlo. TypeORM puede generar queries que no son exactamente lo que necesitas.

### Ejecutar migraciones

```bash
npm run migration:run
```

### Revertir última migración

```bash
npm run migration:revert
```

---

## 7. Estructura de carpetas recomendada

```
src/
├── config/
│   ├── database.config.ts
│   └── env.validation.ts
├── migrations/
│   ├── 1693000000000-CreatePatientsTable.ts
│   └── 1693100000000-AddPhoneToPatient.ts
├── patients/
│   ├── patient.entity.ts
│   ├── patients.module.ts
│   ├── patients.controller.ts
│   └── patients.service.ts
├── app.module.ts
├── app.controller.ts
├── app.service.ts
├── data-source.ts
└── main.ts
```

> Las migraciones viven en `src/` (no en `src/config/`) porque TypeORM las ejecuta con `ts-node` y necesita acceso al contexto de TypeScript del proyecto.

---

## 8. Notas importantes

- **Nunca uses `synchronize: true` en producción.** Siempre migraciones.
- **El `data-source.ts` lee `.env` con `dotenv` directamente**, no con `@nestjs/config`, porque corre fuera del contexto de NestJS (desde la CLI).
- **Una migración = un commit.** No generes migraciones y las modifiques después sin regenerar.
- **Revisa el `down()` de cada migración.** Si no puedes revertir un cambio, la migración es unidireccional y eso complica el deploy.
- **UUIDs como PK** son estándar para sistemasodontológicos (evita colisiones entre clínicas si eventualmente se federan datos). El tipo en la entidad sería `uuid` y en PostgreSQL se usa `uuid_generate_v4()` como default (requiere la extensión `uuid-ossp`).

---

# ANEXO — Plan: Migraciones manuales con entidades (sin generación automática)

## 9. Enfoque

Las migraciones se escriben **a mano** partiendo de las entidades definidas. Esto significa:

- **No** usar el script `migration:generate` (que compara el schema contra la DB y genera SQL por diferencia).
- Cada cambio de schema (crear tabla, añadir columna, crear índice) se traduce **manualmente** a un archivo de migración con su `up()` y `down()`.
- La entidad en TypeScript es la **fuente de verdad** para el runtime de la app; la migración define el schema **real** en PostgreSQL. Ambos deben mantenerse en sincronía de forma deliberada.

## 10. Flujo por cada cambio de schema

1. **Definir la entidad** en `src/<modulo>/<entidad>.entity.ts` (el tipo de cada columna en TypeScript debe reflejar el tipo SQL que crearás).
2. **Crear la migración manual** en `src/migrations/` con número de secuencia (timestamp) como prefijo.
3. **Escribir `up()`**: crea/aplica el cambio SQL. Cada `CREATE TABLE` replica exactamente los decoradores de la entidad.
4. **Escribir `down()`**: revierte el `up()` (DROP TABLE / DROP COLUMN), garantizando reversibilidad.
5. **Ejecutar** `npm run migration:run`.
6. **Verificar** que el schema real coincide con la entidad (restaurar desde un backup del `up()` devuelve lo que la entidad espera).

## 11. Plantilla de migración manual

```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePatientsTable1693000000000 implements MigrationInterface {
  name = 'CreatePatientsTable1693000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

      CREATE TABLE "patient" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying(120) NOT NULL,
        "email" character varying(255) NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_patient_email" UNIQUE ("email"),
        CONSTRAINT "PK_patient" PRIMARY KEY ("id")
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "patient"`);
  }
}
```

## 12. Nombrado (migraciones manuales)

```
src/migrations/<timestamp>-<Nombre>.ts
```

- `<timestamp>`: número Unix en milisegundos (Epoch) para mantener orden cronológico. Se usa como id de orden de ejecución.
- `<Nombre>`: verbo + sustantivo en PascalCase (Ej: `CreatePatientsTable`, `AddPhoneToPatient`, `AddIndexOnAppointmentDate`).

## 13. Sincronización entidad ↔ migración (checklist)

| Entidad (decorador) | Migración (SQL) |
|---|---|
| `@PrimaryGeneratedColumn('uuid')` | `"id" uuid NOT NULL DEFAULT uuid_generate_v4()` + `PRIMARY KEY` |
| `@Column({ length: 120 })` | `character varying(120)` |
| `@Column({ type: 'timestamptz', default: () => 'now()' })` | `TIMESTAMPTZ NOT NULL DEFAULT now()` |
| `@Column({ type: 'boolean', default: false })` | `boolean NOT NULL DEFAULT false` |
| `@Column({ type: 'numeric', precision: 10, scale: 2 })` | `numeric(10,2)` |
| `@OneToMany` / `@ManyToOne` | `FOREIGN KEY ... REFERENCES <tabla>(<col>)` + índice del FK |
| `@Index(['email'])` | `CREATE INDEX ... ON "tabla" ("email")` |
| `@Column({ unique: true })` | `CONSTRAINT "UQ_..." UNIQUE ("col")` |

> El decorador no crea nada por sí mismo en producción (porque `synchronize=false`). **La migración es la que crea el schema.** Si la entidad y la migración no coinciden, la app fallará en runtime al consultar columnas inexistentes.

## 14. Orden propuesto de migraciones a crear (primeras)

> Este anexo solo documenta el plan; las entidades y migraciones se escriben cuando se implemente el módulo correspondiente.

1. `CreateRolesTable` — catálogo base (`uuid`, `name`, `description`, timestamps).
2. `CreateUsersTable` — usuarios del sistema (FK a `roles`, email único).
3. `CreatePatientsTable` — pacientes (datos personales, contacto, timestamps).
4. `CreateAppointmentsTable` — citas (FK a `patients` y `users`, rango de fechas, estado).
5. Migraciones de índices sobre FKs y columnas de búsqueda frecuente (email, fecha de cita).

## 15. Órdenes frecuentes (resumen)

```bash
npm run migration:run      # aplica pendientes (en orden de timestamp)
npm run migration:revert   # revierte la última aplicada
npm run migration:generate # NO se usa; es solo referencia de lo que evitamos
```

## 16. Buenas prácticas específicas del enfoque manual

- **Una migración = un cambio atómico y reversible.** Si un cambio es muy grande, dividirlo en varias migraciones.
- **Nunca editar una migración ya ejecutada** en una DB compartida. Corregirla en una **nueva** migración.
- **Mantener el `.env` con `DB_SYNCHRONIZE=false` siempre.** El schema lo gobierna únicamente las migraciones.
- **Probar `down()`** tras cada `up()` en local antes de llevar el cambio a otro ambiente.
