import * as helmet from 'helmet';
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { json } from 'body-parser';

/*
  Milvus insight API server bootstrap function
*/
async function bootstrap() {
  // by default the server will be listening on port 3000
  const port = 3000;
  // create the nest application with Cross-origin resource sharing
  const app = await NestFactory.create(AppModule, { cors: true });
  // security patches
  app.use(helmet());
  // set upload file size limit
  app.use(json({ limit: '150mb' }));
  // add an API prefix
  app.setGlobalPrefix('/api/v1');

  // prepare swagger config
  const config = new DocumentBuilder()
    .setTitle('Milvus insight')
    .setVersion('1.0')
    .build();
  // create swagger document
  const document = SwaggerModule.createDocument(app, config);
  // set up API
  SwaggerModule.setup('api', app, document);

  // start listening
  await app.listen(port);
  Logger.log(`Milvus insight API server is running on port ${port}`);
}
// Start the server
bootstrap();
