/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { FastifyAdapter, NestFastifyApplication } from "@nestjs/platform-fastify";
import { PlayerController } from "../src/player";
import { Test } from "@nestjs/testing";
import { ValidationPipe } from "@nestjs/common";
import { testKey, testUsername, testUuid } from "./test.constants";
import { useMocker } from "./mocks";

describe("Player", () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [PlayerController],
    })
      .useMocker(useMocker)
      .compile();

    app = moduleRef.createNestApplication<NestFastifyApplication>(new FastifyAdapter());

    app.useGlobalPipes(new ValidationPipe({ transform: true }));

    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  it(`/GET player?player=username`, async () => {
    const result = await app.inject({
      method: "GET",
      url: `/player?player=${testUsername}`,
      headers: {
        "x-api-key": testKey,
      },
    });

    expect(result.statusCode).toEqual(200);
  });

  it(`/GET player?player=uuid`, async () => {
    const result = await app.inject({
      method: "GET",
      url: `/player?player=${testUuid}`,
      headers: {
        "x-api-key": testKey,
      },
    });

    expect(result.statusCode).toEqual(200);
  });

  it(`/GET player/recentgames?player=username`, async () => {
    const result = await app.inject({
      method: "GET",
      url: `/player/recentgames?player=${testUsername}`,
      headers: {
        "x-api-key": testKey,
      },
    });

    expect(result.statusCode).toEqual(200);
  });

  it(`/GET player/recentgames?player=uuid`, async () => {
    const result = await app.inject({
      method: "GET",
      url: `/player/recentgames?player=${testUuid}`,
      headers: {
        "x-api-key": testKey,
      },
    });

    expect(result.statusCode).toEqual(200);
  });

  it(`/GET player/status?player=username`, async () => {
    const result = await app.inject({
      method: "GET",
      url: `/player/status?player=${testUsername}`,
      headers: {
        "x-api-key": testKey,
      },
    });

    expect(result.statusCode).toEqual(200);
  });

  it(`/GET player/status?player=uuid`, async () => {
    const result = await app.inject({
      method: "GET",
      url: `/player/status?player=${testUuid}`,
      headers: {
        "x-api-key": testKey,
      },
    });

    expect(result.statusCode).toEqual(200);
  });

  it("/GET player/friends?player=username", async () => {
    const result = await app.inject({
      method: "GET",
      url: `/player/friends?player=${testUsername}`,
      headers: {
        "x-api-key": testKey,
      },
    });

    expect(result.statusCode).toEqual(200);
  });

  it(`/GET player/friends?player=uuid`, async () => {
    const result = await app.inject({
      method: "GET",
      url: `/player/friends?player=${testUuid}`,
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
