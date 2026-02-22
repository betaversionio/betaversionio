import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger, VersioningType } from '@nestjs/common';
import cookieParser from 'cookie-parser';

import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { mountApiDocs } from './api-docs';
import { mountApiLogs } from './api-logs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // ── CORS ──────────────────────────────────────────────────────────────────
  app.enableCors({
    origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    credentials: true,
  });

  // ── Global prefix ─────────────────────────────────────────────────────────
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: ['1'],
  });

  // ── Cookie parser ─────────────────────────────────────────────────────────
  app.use(cookieParser());

  // ── API docs & logs ──────────────────────────────────────────────────────
  mountApiDocs(app);
  mountApiLogs(app);

  // ── Global pipes ──────────────────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // ── Global filters & interceptors ─────────────────────────────────────────
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  // ── Start ─────────────────────────────────────────────────────────────────
  const port = process.env.PORT || 4000;
  await app.listen(port);

  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(`Swagger docs available at: http://localhost:${port}/api-docs`);
  logger.log(`Scalar reference available at: http://localhost:${port}/reference`);
}

bootstrap();
