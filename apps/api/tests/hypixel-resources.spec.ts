import { ValidationPipe } from '@nestjs/common';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import { Gamecounts, Watchdog } from '@statsify/schemas';
import { MockFunctionMetadata, ModuleMocker } from 'jest-mock';
import { AuthService } from '../src/auth/auth.service';
import { HypixelService } from '../src/hypixel';
import { HypixelResourcesController } from '../src/hypixel-resources';
import { testKey } from './test.constants';

const moduleMocker = new ModuleMocker(global);

describe('HypixelResources', () => {
  let app: NestFastifyApplication;

  const hypixelService = {
    getWatchdog: jest.fn().mockResolvedValue(new Watchdog({})),
    getGamecounts: jest.fn().mockResolvedValue(new Gamecounts()),
  };

  const authService = {
    limited: jest.fn().mockResolvedValue(true),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [HypixelResourcesController],
    })
      .useMocker((token) => {
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

  it(`/GET hypixelresources/watchdog`, async () => {
    const result = await app.inject({
      method: 'GET',
      url: `/hypixelresources/watchdog`,
      headers: {
        'x-api-key': testKey,
      },
    });

    expect(result.statusCode).toEqual(200);

    expect(result.json()).toEqual({
      success: true,
      watchdog: new Watchdog({}),
    });
  });

  it(`/GET hypixelresources/gamecounts`, async () => {
    const result = await app.inject({
      method: 'GET',
      url: `/hypixelresources/gamecounts`,
      headers: {
        'x-api-key': testKey,
      },
    });

    expect(result.statusCode).toEqual(200);

    expect(result.json()).toEqual({
      success: true,
      gamecounts: new Gamecounts(),
    });
  });

  afterAll(async () => {
    await app?.close();
  });
});
