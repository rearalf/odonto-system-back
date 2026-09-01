import { NestFactory } from '@nestjs/core';
import {
  ValidationPipe,
  BadRequestException,
  ValidationError,
} from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module.js';
import helmet from 'helmet';
import { ConfigService } from '@nestjs/config';

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
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const allowedOrigins: string = configService.get('CORS_ORIGIN') ?? '*';

  app.use(helmet());
  app.enableCors({
    origin: allowedOrigins === '*' ? true : allowedOrigins.split(','),
    credentials: false,
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

  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
