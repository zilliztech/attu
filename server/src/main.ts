import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';

import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { json } from 'body-parser';

async function bootstrap() {
  const port = 3000;
  const app = await NestFactory.create(AppModule, {
    cors: true,
  });
  app.setGlobalPrefix('/api/v1');

  const config = new DocumentBuilder()
    .setTitle('Milvus insight')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  app.use(json({ limit: '50mb' }));

  await app.listen(port);
  Logger.log(`Milvus insight API server is running on port ${port}`);
}
bootstrap();
