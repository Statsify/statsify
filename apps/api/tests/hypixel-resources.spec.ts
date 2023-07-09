/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { FastifyAdapter, NestFastifyApplication } from "@nestjs/platform-fastify";
import { HypixelResourcesController } from "../src/hypixel-resources/index.js";
import { Test } from "@nestjs/testing";
import { ValidationPipe } from "@nestjs/common";
import { testKey } from "./test.constants.js";
import { useMocker } from "./mocks/index.js";

describe("HypixelResources", () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [HypixelResourcesController],
    })
      .useMocker(useMocker)
      .compile();

    app = moduleRef.createNestApplication<NestFastifyApplication>(new FastifyAdapter());

    app.useGlobalPipes(new ValidationPipe({ transform: true }));

    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  it(`/GET hypixelresources/watchdog`, async () => {
    const result = await app.inject({
      method: "GET",
      url: `/hypixelresources/watchdog`,
      headers: {
        "x-api-key": testKey,
      },
    });

    expect(result.statusCode).toEqual(200);
  });

  it(`/GET hypixelresources/gamecounts`, async () => {
    const result = await app.inject({
      method: "GET",
      url: `/hypixelresources/gamecounts`,
      headers: {
        "x-api-key": testKey,
      },
    });

    expect(result.statusCode).toEqual(200);
  });

  afterAll(async () => {
    await app?.close();
  });
});
