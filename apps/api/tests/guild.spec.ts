import { ValidationPipe } from '@nestjs/common';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import { Guild } from '@statsify/schemas';
import { MockFunctionMetadata, ModuleMocker } from 'jest-mock';
import { AuthService } from '../src/auth/auth.service';
import { GuildController, GuildQuery, GuildService } from '../src/guild';
import { testKey, testUsername } from './test.constants';

const moduleMocker = new ModuleMocker(global);

describe('Guild', () => {
  let app: NestFastifyApplication;

  const guildService = {
    findOne: jest.fn().mockResolvedValue(new Guild()),
  };

  const authService = {
    limited: jest.fn().mockResolvedValue(true),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [GuildController],
    })
      .useMocker((token) => {
        if (token === GuildService) {
          return guildService;
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

  it(`/GET guild?guild=name&type=${GuildQuery.NAME}`, async () => {
    const result = await app.inject({
      method: 'GET',
      url: `/guild?guild=${testUsername}&type=${GuildQuery.NAME}`,
      headers: {
        'x-api-key': testKey,
      },
    });

    expect(result.statusCode).toEqual(200);

    expect(result.json()).toEqual({
      success: true,
      // Weird hack to make this test pass
      guild: JSON.parse(JSON.stringify(new Guild())),
    });
  });

  it(`/GET guild?guild=name`, async () => {
    const result = await app.inject({
      method: 'GET',
      url: `/guild?guild=${testUsername}`,
      headers: {
        'x-api-key': testKey,
      },
    });

    expect(result.statusCode).toEqual(400);
  });

  afterAll(async () => {
    await app?.close();
  });
});
