import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap(port = process.env.PORT ?? 3000) {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('Croona API')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('openapi', app, document);

  await app.listen(port);
  Logger.log(`Server running on     http://localhost:${port}`, 'Main');
  Logger.log(`OpenAPI running on    http://localhost:${port}/openapi`, 'Main');
  Logger.log(`Health on             http://localhost:${port}/health`, 'Main');
  Logger.log(`Metrics available at  http://localhost:${port}/metrics`, 'Main');
}

bootstrap();
