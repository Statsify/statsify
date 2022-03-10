import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from '@statsify/logger';
import { setGlobalOptions } from '@typegoose/typegoose';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  //Removes the `_id` fields created from sub classes of documents
  setGlobalOptions({ schemaOptions: { _id: false } });

  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter(), {
    logger: new Logger(),
  });

  app.setGlobalPrefix('/api');

  //Validation using `class-validator` and `class-transformer`
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  //Swagger/Redoc docs
  const config = new DocumentBuilder()
    .setTitle('Statsify API')
    .setVersion('1.0')
    .addSecurity('basic', { type: 'apiKey', scheme: 'basic', in: 'header', name: 'x-api-key' })
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
