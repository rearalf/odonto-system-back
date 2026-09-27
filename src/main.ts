import { NestFactory } from '@nestjs/core';
import {
  ValidationPipe,
  BadRequestException,
  ValidationError,
  Logger,
} from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module.js';
import helmetModule from 'helmet';
import type { Request, RequestHandler, Response } from 'express';
import { ConfigService } from '@nestjs/config';

const helmet = helmetModule as unknown as () => RequestHandler;

function flattenValidationErrors(errors: ValidationError[]): string[] {
  return errors.flatMap((error) => {
    const messages = Object.values(error.constraints ?? {});
    if (error.children?.length) {
      return flattenValidationErrors(error.children);
    }
    return messages;
  });
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { abortOnError: false });

  const configService = app.get(ConfigService);
  const allowedOrigins: string = configService.get('CORS_ORIGIN') ?? '*';

  app.use(helmet());
  app.enableCors({
    origin: allowedOrigins === '*' ? true : allowedOrigins.split(','),
    credentials: false,
    exposedHeaders: ['page', 'per_page', 'total_count', 'total_pages'],
  });

  app.use(cookieParser());

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      stopAtFirstError: true,
      exceptionFactory: (errors: ValidationError[]) => {
        const formattedErrors = flattenValidationErrors(errors);
        return new BadRequestException(formattedErrors);
      },
    }),
  );

  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Odonto System API')
      .setDescription('API para gestión de consultorio odontológico')
      .setVersion('1.0')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
  }

  return app;
}

const logger = new Logger('Bootstrap');
const log = (msg: string, err?: unknown) =>
  err === undefined
    ? logger.log(msg)
    : logger.error(msg, err instanceof Error ? err.stack : String(err));

process.on('unhandledRejection', (err) => log('unhandledRejection', err));
process.on('uncaughtException', (err) => log('uncaughtException', err));

log(`booting ${process.env.NODE_ENV} vercel=${!!process.env.VERCEL}`);

const app = await bootstrap().catch((err: unknown) => {
  log('bootstrap failed', err);
  process.exit(1);
});

await app.init().catch((err: unknown) => {
  log('init failed', err);
  process.exit(1);
});

log('ready');

export default (req: Request, res: Response) =>
  app.getHttpAdapter().getInstance()(req, res);

if (!process.env.VERCEL) {
  await app.listen(process.env.PORT ?? 3000);
}
