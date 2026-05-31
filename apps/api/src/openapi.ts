/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { FastifyAdapter, NestFastifyApplication } from "@nestjs/platform-fastify";
import { NestFactory } from "@nestjs/core";
import { Severity, setGlobalOptions } from "@typegoose/typegoose";
import { ValidationPipe } from "@nestjs/common";
import { config } from "@statsify/util";
import { createSwaggerDocument } from "./swagger.js";
import { dirname, join } from "node:path";
import { dump } from "js-yaml";
import { fileURLToPath } from "node:url";
import { mkdir, writeFile } from "node:fs/promises";

const __dirname = dirname(fileURLToPath(import.meta.url));

process.env.STATSIFY_OPENAPI_GENERATE = "1";
process.env.VITEST ??= "1";

process.on("uncaughtException", console.error);
process.on("unhandledRejection", console.error);

const mediaRoot = await config("api.mediaRoot", { default: "/tmp/statsify-openapi" });

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

const { AppModule } = await import("./app.module.js");

const app = await NestFactory.create<NestFastifyApplication>(AppModule, adapter, {
  logger: false,
});

app.useGlobalPipes(new ValidationPipe({ transform: true }));

const document = createSwaggerDocument(app);
const outputPath = join(__dirname, "..", "..", "..", "statsify.openapi.yaml");

await writeFile(outputPath, dump(document, { noRefs: true, lineWidth: 120 }));
void app.close();
process.exit(0);
