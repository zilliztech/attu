import * as helmet from 'helmet';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { json } from 'body-parser';
import * as hyperlinker from 'hyperlinker';

/*
  Milvus insight API server bootstrap function
*/
async function bootstrap() {
  // by default the server will be listening on port 3000
  const port = 3000;
  // create the nest application with Cross-origin resource sharing
  const app = await NestFactory.create(AppModule, { cors: true });
  // security patches
  app.use(
    helmet({
      // If true will cause blank page after client build.
      contentSecurityPolicy: false,
    }),
  );
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

  // output server info
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('dns').lookup(require('os').hostname(), (err, add, fam) => {
    // get link
    // add = `127.0.0.1`;
    const link = `http://${add}:${port}/api`;
    const blue = `\x1b[34m%s\x1b[0m`;
    const light = '\x1b[1m%s\x1b[0m';
    console.log(blue, '\n    Milvus insight server started.');
    console.log(
      light,
      `    View the API docs on ${hyperlinker(link, link)} \n`,
    );
  });
}
// Start the server
bootstrap();
