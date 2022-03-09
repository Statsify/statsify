import { ValidationPipe } from '@nestjs/common';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import { Friends, Player, RankedSkyWars, Status } from '@statsify/schemas';
import { MockFunctionMetadata, ModuleMocker } from 'jest-mock';
import { AuthService } from '../src/auth/auth.service';
import { HypixelService } from '../src/hypixel';
import { PlayerController, PlayerService } from '../src/player';
import { testKey, testUsername, testUuid } from './test.constants';

const moduleMocker = new ModuleMocker(global);

describe('Player', () => {
  let app: NestFastifyApplication;

  const playerService = {
    findOne: jest.fn().mockResolvedValue(new Player()),
    findFriends: jest.fn().mockResolvedValue(new Friends({})),
  };

  const hypixelService = {
    getRecentGames: jest.fn().mockResolvedValue([]),
    getStatus: jest.fn().mockResolvedValue(new Status({})),
    getRankedSkyWars: jest.fn().mockResolvedValue(new RankedSkyWars({})),
  };

  const authService = {
    limited: jest.fn().mockResolvedValue(true),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [PlayerController],
    })
      .useMocker((token) => {
        if (token === PlayerService) {
          return playerService;
        }

        if (token === HypixelService) {
          return hypixelService;
        }

        if (token === AuthService) {
          return authService;
        }

        if (typeof token === 'function') {
          const mockMetadata = moduleMocker.getMetadata(token) as MockFunctionMetadata<any, any>;
          const Mock = moduleMocker.generateFromMetadata(mockMetadata);
          return new Mock();
        }
      })
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

    expect(result.json()).toEqual({
      success: true,
      player: new Player(),
    });
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

    expect(result.json()).toEqual({
      success: true,
      player: new Player(),
    });
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
