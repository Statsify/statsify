import { ValidationPipe } from '@nestjs/common';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import { deserialize, Friends, Player, RankedSkyWars, Status } from '@statsify/schemas';
import { flatten } from '@statsify/util';
import { PlayerController } from '../src/player';
import { useMocker } from './mocks';
import { testKey, testUsername, testUuid } from './test.constants';

describe('Player', () => {
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
      method: 'GET',
      url: `/player?player=${testUsername}`,
      headers: {
        'x-api-key': testKey,
      },
    });

    expect(result.statusCode).toEqual(200);

    const response = result.json();

    expect(response.success).toBe(true);
  });

  it(`/GET player?player=uuid`, async () => {
    const result = await app.inject({
      method: 'GET',
      url: `/player?player=${testUuid}`,
      headers: {
        'x-api-key': testKey,
      },
    });

    expect(result.statusCode).toEqual(200);

    const response = result.json();

    expect(response.success).toBe(true);
  });

  it(`/GET player/recentgames?uuid=username`, async () => {
    const result = await app.inject({
      method: 'GET',
      url: `/player/recentgames?uuid=${testUsername}`,
      headers: {
        'x-api-key': testKey,
      },
    });

    expect(result.statusCode).toEqual(400);
  });

  it(`/GET player/recentgames?uuid=uuid`, async () => {
    const result = await app.inject({
      method: 'GET',
      url: `/player/recentgames?uuid=${testUuid}`,
      headers: {
        'x-api-key': testKey,
      },
    });

    expect(result.statusCode).toEqual(200);

    expect(result.json()).toEqual({
      success: false,
      games: [],
    });
  });

  it(`/GET player/status?uuid=username`, async () => {
    const result = await app.inject({
      method: 'GET',
      url: `/player/status?uuid=${testUsername}`,
      headers: {
        'x-api-key': testKey,
      },
    });

    expect(result.statusCode).toEqual(400);
  });

  it(`/GET player/status?uuid=uuid`, async () => {
    const result = await app.inject({
      method: 'GET',
      url: `/player/status?uuid=${testUuid}`,
      headers: {
        'x-api-key': testKey,
      },
    });

    expect(result.statusCode).toEqual(200);

    expect(result.json()).toEqual({
      success: true,
      status: new Status({}),
    });
  });

  it('/GET player/friends?player=username', async () => {
    const result = await app.inject({
      method: 'GET',
      url: `/player/friends?player=${testUsername}`,
      headers: {
        'x-api-key': testKey,
      },
    });

    expect(result.statusCode).toEqual(400);
  });

  it(`/GET player/friends?player=uuid`, async () => {
    const result = await app.inject({
      method: 'GET',
      url: `/player/friends?player=${testUuid}`,
      headers: {
        'x-api-key': testKey,
      },
    });

    expect(result.statusCode).toEqual(400);
  });

  it(`/GET player/friends?player=uuid&page=0`, async () => {
    const result = await app.inject({
      method: 'GET',
      url: `/player/friends?player=${testUuid}&page=0`,
      headers: {
        'x-api-key': testKey,
      },
    });

    expect(result.statusCode).toEqual(200);

    expect(result.json()).toEqual({
      success: true,
      friends: new Friends({}),
    });
  });

  it(`/GET player/rankedskywars?uuid=username`, async () => {
    const result = await app.inject({
      method: 'GET',
      url: `/player/rankedskywars?uuid=${testUsername}`,
      headers: {
        'x-api-key': testKey,
      },
    });

    expect(result.statusCode).toEqual(400);
  });

  it(`/GET player/rankedskywars?uuid=uuid`, async () => {
    const result = await app.inject({
      method: 'GET',
      url: `/player/rankedskywars?uuid=${testUuid}`,
      headers: {
        'x-api-key': testKey,
      },
    });

    expect(result.statusCode).toEqual(200);

    expect(result.json()).toEqual({
      success: true,
      rankedSkyWars: new RankedSkyWars({}),
    });
  });

  afterAll(async () => {
    await app?.close();
  });
});
