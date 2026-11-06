/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import handlebars from "handlebars";
import packageJson from "../package.json" with { type: "json" };
import { AppModule } from "./app.module.js";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { FastifyAdapter, NestFastifyApplication } from "@nestjs/platform-fastify";
import {
  Logger,
  NestLogger,
  type RequestOutcome,
  emitRequestEvent,
  getRequestAttributes,
  setRequestAttributes,
} from "@statsify/logger";
import { NestFactory } from "@nestjs/core";
import { SentryInterceptor } from "./sentry/index.js";
import { Severity, setGlobalOptions } from "@typegoose/typegoose";
import { ValidationPipe } from "@nestjs/common";
import { config } from "@statsify/util";
import { join } from "node:path";
import { mkdir } from "node:fs/promises";

const directory = import.meta.dirname;

const logger = new Logger("api");

process.on("uncaughtException", (error) => logger.error(error));
process.on("unhandledRejection", (reason) => logger.error(reason));

const SLOW_REQUEST_MS = 2500;

const getOutcome = (status: number): RequestOutcome => {
  if (status >= 500) return "error";
  if (status >= 400) return "message";
  return "success";
};

const mediaRoot = await config("api.mediaRoot");

await mkdir(join(mediaRoot, "badges"), { recursive: true });

// Removes the `_id` fields created from sub classes of documents
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

adapter.getInstance().addHook("onRequest", (request, _reply, done) => {
  const { player, uuid, guild, cache } = request.query as Record<string, string | undefined>;

  setRequestAttributes({
    "http.request.method": request.method,
    "http.route": request.routeOptions.url,
    "statsify.player.tag": player ?? uuid,
    "statsify.guild.tag": guild,
    "statsify.cache.level": cache,
  });

  done();
});

// A Nest interceptor would miss requests the guards reject
adapter.getInstance().addHook("onResponse", (request, reply, done) => {
  const status = reply.statusCode;
  const { "statsify.outcome": outcome } = getRequestAttributes();

  setRequestAttributes({
    "http.response.status_code": status,
    "statsify.outcome": outcome ?? getOutcome(status),
  });

  emitRequestEvent([request.method, request.routeOptions.url].filter(Boolean).join(" "), {
    durationMs: reply.elapsedTime,
    slowMs: SLOW_REQUEST_MS,
  });

  done();
});

const app = await NestFactory.create<NestFastifyApplication>(AppModule, adapter, {
  logger: new NestLogger(),
});

// Validation using `class-validator` and `class-transformer`
app.useGlobalPipes(new ValidationPipe({ transform: true }));

// Sentry
app.useGlobalInterceptors(new SentryInterceptor());

// Swagger/Redoc docs
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

// Fastify template renderer for Redoc
app.setViewEngine({
  engine: { handlebars },
  templates: join(directory, "..", "views"),
});

const document = SwaggerModule.createDocument(app, redoc);

SwaggerModule.setup("swagger", app, document);

await app.listen(await config("api.port"));
