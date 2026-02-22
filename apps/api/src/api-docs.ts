import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import swStats from 'swagger-stats';

export function mountApiDocs(app: INestApplication<any>) {
  const config = new DocumentBuilder()
    .setTitle('BetaVersion.IO API')
    .setDescription('The BetaVersion.IO platform API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  app.use(
    '/reference',
    apiReference({
      content: document,
      theme: 'deepSpace',
    }),
  );

  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  app.use(swStats.getMiddleware({ swaggerSpec: document }));
}
