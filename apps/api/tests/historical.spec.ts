import { ValidationPipe } from '@nestjs/common';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import { Player } from '@statsify/schemas';
import { HistoricalController, HistoricalType } from '../src/historical';
import { useMocker } from './mocks';
import { testKey, testUsername } from './test.constants';

describe('Historical', () => {
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
      method: 'GET',
      url: `/historical?player=${testUsername}`,
      headers: {
        'x-api-key': testKey,
      },
    });

    expect(result.statusCode).toEqual(400);
  });

  it(`/GET historical?player=username&type=${HistoricalType.DAILY}`, async () => {
    const result = await app.inject({
      method: 'GET',
      url: `/historical?player=${testUsername}&type=${HistoricalType.DAILY}`,
      headers: {
        'x-api-key': testKey,
      },
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
