import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from '@statsify/logger';
import { setGlobalOptions } from '@typegoose/typegoose';
import { mkdir } from 'fs/promises';
import { join } from 'path';
import { version } from '../../../package.json';
import { AppModule } from './app.module';

async function bootstrap() {
  await mkdir(join(process.env.API_MEDIA_ROOT, 'badges'), { recursive: true });

  //Removes the `_id` fields created from sub classes of documents
  setGlobalOptions({ schemaOptions: { _id: false } });

  const adapter = new FastifyAdapter();

  // This parses the content for when PNGs are sent to the API
  adapter
    .getInstance()
    .addContentTypeParser('image/png', { parseAs: 'buffer' }, (_, body, done) => done(null, body));

  const app = await NestFactory.create<NestFastifyApplication>(AppModule, adapter, {
    logger: new Logger(),
  });

  app.setGlobalPrefix('/api');

  //Validation using `class-validator` and `class-transformer`
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  //Swagger/Redoc docs
  const config = new DocumentBuilder()
    .setTitle('Statsify API')
    .setVersion(version)
    .setDescription(
      '# Introduction\nThis is the official Statsify API documentation. [Website](https://statsify.net/) - [GitHub](https://github.com/Statsify/statsify)\n# Authentication\n\n<!-- ReDoc-Inject: <security-definitions> -->'
    )
    .addSecurity('ApiKey', {
      type: 'apiKey',
      in: 'header',
      name: 'x-api-key',
    })
    .build();

  //Fastify template renderer for Redoc
  app.setViewEngine({
    engine: {
      handlebars: require('handlebars'),
    },
    templates: join(__dirname, '..', 'views'),
  });

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('swagger', app, document);

  await app.listen(process.env.API_PORT);
}

bootstrap();
