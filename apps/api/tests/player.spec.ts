import { ValidationPipe } from '@nestjs/common';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import { Friends, Player, RankedSkyWars, Status } from '@statsify/schemas';
import { MockFunctionMetadata, ModuleMocker } from 'jest-mock';
import { HypixelService } from '../src/hypixel';
import { PlayerController, PlayerService } from '../src/player';
import { testUsername, testUuid } from './test.constants';

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
    });

    expect(result.statusCode).toEqual(400);
  });

  it(`/GET player/recentgames?uuid=uuid`, async () => {
    const result = await app.inject({
      method: 'GET',
      url: `/player/recentgames?uuid=${testUuid}`,
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
    });

    expect(result.statusCode).toEqual(400);
  });

  it(`/GET player/status?uuid=uuid`, async () => {
    const result = await app.inject({
      method: 'GET',
      url: `/player/status?uuid=${testUuid}`,
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
    });

    expect(result.statusCode).toEqual(400);
  });

  it(`/GET player/friends?player=uuid`, async () => {
    const result = await app.inject({
      method: 'GET',
      url: `/player/friends?player=${testUuid}`,
    });

    expect(result.statusCode).toEqual(400);
  });

  it(`/GET player/friends?player=uuid&page=0`, async () => {
    const result = await app.inject({
      method: 'GET',
      url: `/player/friends?player=${testUuid}&page=0`,
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
    });

    expect(result.statusCode).toEqual(400);
  });

  it(`/GET player/rankedskywars?uuid=uuid`, async () => {
    const result = await app.inject({
      method: 'GET',
      url: `/player/rankedskywars?uuid=${testUuid}`,
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
