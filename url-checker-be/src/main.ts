import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Response } from 'express';
import * as YAML from 'yaml';

import { AppModule } from './app.module';
import { createValidationException } from './shared/http/httpResponseTexts';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: '*' });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: createValidationException,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('API сервиса проверки URL')
    .setDescription('Документация API сервиса проверки URL')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access-token',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
  app.getHttpAdapter().get('/api.yaml', (req, res: Response) => {
    res.type('application/yaml');
    res.send(YAML.stringify(document));
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') ?? 5001;
  await app.listen(port);
}
void bootstrap();
