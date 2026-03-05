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
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const rootDomain = process.env.ROOT_DOMAIN || 'betaversion.io';
  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true);
      // Allow the main app URL
      if (origin === appUrl) return callback(null, true);
      // Allow any subdomain of the root domain
      if (new RegExp(`^https?://[\\w-]+\\.${rootDomain.replace('.', '\\.')}$`).test(origin)) {
        return callback(null, true);
      }
      // Allow localhost subdomains in dev
      if (/^http:\/\/[\w-]+\.localhost(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }
      // Allow all origins for public portfolio API (community templates fetch from any domain)
      return callback(null, true);
    },
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
