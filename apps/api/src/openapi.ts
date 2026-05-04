/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import * as Sentry from "@sentry/node";
import { AppModule } from "./app.module.js";
import { FastifyAdapter, NestFastifyApplication } from "@nestjs/platform-fastify";
import { Logger } from "@statsify/logger";
import { NestFactory } from "@nestjs/core";
import { SentryInterceptor } from "./sentry/index.js";
import { Severity, setGlobalOptions } from "@typegoose/typegoose";
import { ValidationPipe } from "@nestjs/common";
import { config } from "@statsify/util";
import { createSwaggerDocument } from "./swagger.js";
import { dirname, join } from "node:path";
import { dump } from "js-yaml";
import { fileURLToPath } from "node:url";
import { mkdir, writeFile } from "node:fs/promises";

const __dirname = dirname(fileURLToPath(import.meta.url));

const logger = new Logger("openapi");
const handleError = logger.error.bind(logger);

process.on("uncaughtException", handleError);
process.on("unhandledRejection", handleError);

const sentryDsn = await config("sentry.apiDsn", { required: false });

if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    integrations: [
      new Sentry.Integrations.Http({ tracing: false, breadcrumbs: true }),
      new Sentry.Integrations.Mongo({ useMongoose: true }),
    ],
    normalizeDepth: 3,
    tracesSampleRate: await config("sentry.tracesSampleRate"),
    environment: await config("environment"),
  });
}

const mediaRoot = await config("api.mediaRoot");

await mkdir(join(mediaRoot, "badges"), { recursive: true });

setGlobalOptions({
  options: { allowMixed: Severity.ALLOW },
  schemaOptions: { _id: false },
});

const adapter = new FastifyAdapter({ bodyLimit: 5e6 });

adapter
  .getInstance()
  .addContentTypeParser("image/png", { parseAs: "buffer" }, (_, body, done) =>
    done(null, body)
  );

const app = await NestFactory.create<NestFastifyApplication>(AppModule, adapter, {
  logger: new Logger(),
});

app.useGlobalPipes(new ValidationPipe({ transform: true }));
app.useGlobalInterceptors(new SentryInterceptor());

const document = createSwaggerDocument(app);
const outputPath = join(__dirname, "..", "..", "..", "statsify.openapi.yaml");

await writeFile(outputPath, dump(document, { noRefs: true, lineWidth: 120 }));
void app.close();
process.exit(0);
