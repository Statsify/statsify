/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import * as Sentry from "@sentry/node";
import handlebars from "handlebars";
import packageJson from "../package.json" assert { type: "json" };
import { AppModule } from "./app.module.js";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { FastifyAdapter, NestFastifyApplication } from "@nestjs/platform-fastify";
import { Logger } from "@statsify/logger";
import { NestFactory } from "@nestjs/core";
import { SentryInterceptor } from "./sentry/index.js";
import { Severity, setGlobalOptions } from "@typegoose/typegoose";
import { ValidationPipe } from "@nestjs/common";
import { config } from "@statsify/util";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { mkdir } from "node:fs/promises";

const __dirname = dirname(fileURLToPath(import.meta.url));

const logger = new Logger("api");
const handleError = logger.error.bind(logger);

process.on("uncaughtException", handleError);
process.on("unhandledRejection", handleError);

const sentryDsn = config("sentry.apiDsn", { required: false });

if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    integrations: [
      Sentry.httpIntegration({ breadcrumbs:true }),
      Sentry.mongooseIntegration(),
      Sentry.mongoIntegration(),
    ],
    normalizeDepth: 3,
    tracesSampleRate: config("sentry.tracesSampleRate"),
    environment: config("environment"),
  });
}

await mkdir(join(config("api.mediaRoot"), "badges"), { recursive: true });

//Removes the `_id` fields created from sub classes of documents
setGlobalOptions({
  options: { allowMixed: Severity.ALLOW },
  schemaOptions: { _id: false },
});

const adapter = new FastifyAdapter({ bodyLimit: 5e6 });

// This parses the content for when PNGs are sent to the API
adapter
  .getInstance()
  .addContentTypeParser("image/png", { parseAs: "buffer" }, (_, body, done) =>
    done(null, body)
  );

const app = await NestFactory.create<NestFastifyApplication>(AppModule, adapter, {
  logger: new Logger(),
});

//Validation using `class-validator` and `class-transformer`
app.useGlobalPipes(new ValidationPipe({ transform: true }));

//Sentry
app.useGlobalInterceptors(new SentryInterceptor());

//Swagger/Redoc docs
const redoc = new DocumentBuilder()
  .setTitle("Statsify API")
  .setVersion(packageJson.version)
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
  engine: { handlebars },
  templates: join(__dirname, "..", "views"),
});

const document = SwaggerModule.createDocument(app, redoc);

SwaggerModule.setup("swagger", app, document);

await app.listen(config("api.port"));
