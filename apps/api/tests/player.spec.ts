import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import { Friends, Player } from '@statsify/schemas';
import { HypixelService } from '../src/hypixel';
import { PlayerController, PlayerService } from '../src/player';

describe('Player', () => {
  let app: NestFastifyApplication;

  const playerService = {
    findOne: () => new Player({}),
    findFriends: () => new Friends({}),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [PlayerController],
      providers: [
        {
          provide: PlayerService,
          useValue: playerService,
        },
        {
          provide: HypixelService,
          useValue: {},
        },
      ],
    }).compile();

    app = moduleRef.createNestApplication<NestFastifyApplication>(new FastifyAdapter());

    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  it(`/GET player`, async () => {
    const result = await app.inject({
      method: 'GET',
      url: '/player?player=j4cobi',
    });

    expect(result.statusCode).toEqual(200);

    expect(result.json()).toEqual({
      success: true,
      player: playerService.findOne(),
    });
  });

  afterAll(async () => {
    await app?.close();
  });
});
