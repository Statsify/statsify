import { ValidationPipe } from '@nestjs/common';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import { Player } from '@statsify/schemas';
import { MockFunctionMetadata, ModuleMocker } from 'jest-mock';
import { HistoricalController, HistoricalService, HistoricalType } from '../src/historical';
import { testUsername } from './test.constants';

const moduleMocker = new ModuleMocker(global);

describe('Historical', () => {
  let app: NestFastifyApplication;

  const historicalService = {
    findOne: jest.fn().mockResolvedValue([new Player(), new Player(), false]),
    findAndReset: jest.fn().mockResolvedValue(new Player()),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [HistoricalController],
    })
      .useMocker((token) => {
        if (token === HistoricalService) {
          return historicalService;
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

  it(`/GET historical?player=username`, async () => {
    const result = await app.inject({
      method: 'GET',
      url: `/historical?player=${testUsername}`,
    });

    expect(result.statusCode).toEqual(400);
  });

  it(`/GET historical?player=username&type=${HistoricalType.DAILY}`, async () => {
    const result = await app.inject({
      method: 'GET',
      url: `/historical?player=${testUsername}&type=${HistoricalType.DAILY}`,
    });

    expect(result.statusCode).toEqual(200);

    expect(result.json()).toEqual({
      success: true,
      newPlayer: new Player(),
      oldPlayer: new Player(),
      isNew: false,
    });
  });

  afterAll(async () => {
    await app?.close();
  });
});
