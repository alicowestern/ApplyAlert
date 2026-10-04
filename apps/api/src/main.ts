import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { VersioningType } from '@nestjs/common';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true,
    },
  });

  app.use(helmet());

  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.useGlobalFilters(new AllExceptionsFilter());

  const config = new DocumentBuilder()
    .setTitle('ApplyAlert API')
    .setDescription('ApplyAlert backend API for opportunity management and tracking')
    .setVersion('1.0')
    .addApiKey({ type: 'apiKey', name: 'x-dev-user-id', in: 'header' }, 'x-dev-user-id')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`ApplyAlert API is running on: http://localhost:${port}/api/v1`);
  console.log(`OpenAPI documentation: http://localhost:${port}/api/docs`);
}
bootstrap();
