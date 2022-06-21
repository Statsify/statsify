/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { FastifyAdapter, NestFastifyApplication } from "@nestjs/platform-fastify";
import { GuildController } from "../src/guild";
import { GuildQuery } from "@statsify/api-client";
import { Test } from "@nestjs/testing";
import { ValidationPipe } from "@nestjs/common";
import { testKey, testUsername } from "./test.constants";
import { useMocker } from "./mocks";

describe("Guild", () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [GuildController],
    })
      .useMocker(useMocker)
      .compile();

    app = moduleRef.createNestApplication<NestFastifyApplication>(new FastifyAdapter());

    app.useGlobalPipes(new ValidationPipe({ transform: true }));

    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  it(`/GET guild?guild=name&type=${GuildQuery.NAME}`, async () => {
    const result = await app.inject({
      method: "GET",
      url: `/guild?guild=${testUsername}&type=${GuildQuery.NAME}`,
      headers: {
        "x-api-key": testKey,
      },
    });

    expect(result.statusCode).toEqual(200);
  });

  it(`/GET guild?guild=name`, async () => {
    const result = await app.inject({
      method: "GET",
      url: `/guild?guild=${testUsername}`,
      headers: {
        "x-api-key": testKey,
      },
    });

    expect(result.statusCode).toEqual(400);
  });

  afterAll(async () => {
    await app?.close();
  });
});
