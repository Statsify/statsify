/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import packageJson from "../package.json" with { type: "json" };
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import type { NestFastifyApplication } from "@nestjs/platform-fastify";

export function createSwaggerConfig() {
  return new DocumentBuilder()
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
}

export function createSwaggerDocument(app: NestFastifyApplication) {
  return SwaggerModule.createDocument(app, createSwaggerConfig());
}
