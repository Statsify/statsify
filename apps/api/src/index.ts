/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import * as Sentry from "@sentry/node";
import { AppModule } from "./app.module";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { FastifyAdapter, NestFastifyApplication } from "@nestjs/platform-fastify";
import { Logger } from "@statsify/logger";
import { NestFactory } from "@nestjs/core";
import { SentryInterceptor } from "./sentry/sentry.interceptor";
import { Integrations as TracingIntegrations } from "@sentry/tracing";
import { ValidationPipe } from "@nestjs/common";
import { env } from "@statsify/util";
import { join } from "node:path";
import { mkdir } from "node:fs/promises";
import { setGlobalOptions } from "@typegoose/typegoose";
import { version } from "../../../package.json";

async function bootstrap() {
  const sentryDsn = env("sentry.apiDSN", { required: false });

  if (sentryDsn) {
    Sentry.init({
      dsn: sentryDsn,
      integrations: [
        new Sentry.Integrations.Http({ tracing: false, breadcrumbs: true }),
        new TracingIntegrations.Mongo({ useMongoose: true }),
      ],
      normalizeDepth: 3,
      tracesSampleRate: 1,
      environment: env("nodeEnv"),
    });
  }

  await mkdir(join(env("statsifyAPI.mediaRoot"), "badges"), { recursive: true });

  //Removes the `_id` fields created from sub classes of documents
  setGlobalOptions({ schemaOptions: { _id: false } });

  const adapter = new FastifyAdapter();

  // This parses the content for when PNGs are sent to the API
  adapter
    .getInstance()
    .addContentTypeParser("image/png", { parseAs: "buffer" }, (_, body, done) =>
      done(null, body)
    );

  const app = await NestFactory.create<NestFastifyApplication>(AppModule, adapter, {
    logger: new Logger(),
  });

  app.setGlobalPrefix("/api");

  //Validation using `class-validator` and `class-transformer`
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  //Sentry
  app.useGlobalInterceptors(new SentryInterceptor());

  //Swagger/Redoc docs
  const config = new DocumentBuilder()
    .setTitle("Statsify API")
    .setVersion(version)
    .setDescription(
      "# Introduction\nThis is the official Statsify API documentation. [Website](https://statsify.net/) - [GitHub](https://github.com/Statsify/statsify)\n# Authentication\n\n<!-- ReDoc-Inject: <security-definitions> -->"
    )
    .addSecurity("ApiKey", {
      type: "apiKey",
      in: "header",
      name: "x-api-key",
    })
    .build();

  //Fastify template renderer for Redoc
  app.setViewEngine({
    engine: {
      handlebars: require("handlebars"),
    },
    templates: join(__dirname, "..", "views"),
  });

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup("swagger", app, document);

  await app.listen(env("statsifyAPI.port"));
}

bootstrap();
