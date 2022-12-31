/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { FastifyAdapter, NestFastifyApplication } from "@nestjs/platform-fastify";
import { HistoricalController } from "../src/historical";
import { HistoricalTimes } from "@statsify/api-client";
import { Test } from "@nestjs/testing";
import { ValidationPipe } from "@nestjs/common";
import { testKey, testUsername } from "./test.constants";
import { useMocker } from "./mocks";

describe("Historical", () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [HistoricalController],
    })
      .useMocker(useMocker)
      .compile();

    app = moduleRef.createNestApplication<NestFastifyApplication>(new FastifyAdapter());

    app.useGlobalPipes(new ValidationPipe({ transform: true }));

    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  it(`/GET historical?player=username`, async () => {
    const result = await app.inject({
      method: "GET",
      url: `/historical?player=${testUsername}`,
      headers: {
        "x-api-key": testKey,
      },
    });

    expect(result.statusCode).toEqual(400);
  });

  it(`/GET historical?player=username&type=${HistoricalTimes.DAILY}`, async () => {
    const result = await app.inject({
      method: "GET",
      url: `/historical?player=${testUsername}&type=${HistoricalTimes.DAILY}`,
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
