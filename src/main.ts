import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as fse from 'fs-extra';
import * as process from 'process';
import * as path from 'path';

async function bootstrap(port = process.env.PORT ?? 3000) {
  const keyPath = path.join(process.cwd(), 'HostPrivateKey.pem');
  const existKey = await fse.exists(keyPath);
  const httpsOptions = existKey
    ? {
        key: fse.readFileSync(keyPath),
        cert: fse.readFileSync(path.join(process.cwd(), 'HostCertificate.pem')),
      }
    : undefined;

  const app = await NestFactory.create(AppModule, {
    httpsOptions,
  });
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());

  const config = new DocumentBuilder()
    .setTitle('Croona API')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('openapi', app, document);

  await app.listen(port);
  const protocol = existKey ? 'https' : 'http';
  Logger.log(`Server    ${protocol}://localhost:${port}`, 'Main');
  Logger.log(`OpenAPI   ${protocol}://localhost:${port}/openapi`, 'Main');
  Logger.log(`Health    ${protocol}://localhost:${port}/health`, 'Main');
  Logger.log(`Metrics   ${protocol}://localhost:${port}/metrics`, 'Main');
}

bootstrap();
