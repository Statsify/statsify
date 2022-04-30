import { ValidationPipe } from '@nestjs/common';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import { GuildQuery } from '@statsify/api-client';
import { GuildController } from '../src/guild';
import { useMocker } from './mocks';
import { testKey, testUsername } from './test.constants';

describe('Guild', () => {
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
      method: 'GET',
      url: `/guild?guild=${testUsername}&type=${GuildQuery.NAME}`,
      headers: {
        'x-api-key': testKey,
      },
    });

    expect(result.statusCode).toEqual(200);
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
