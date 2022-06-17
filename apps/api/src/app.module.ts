import { TypegooseModule } from '@m8a/nestjs-typegoose';
import { RedisModule } from '@nestjs-modules/ioredis';
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AuthModule } from './auth';
import { GuildModule } from './guild';
import { HistoricalModule } from './historical';
import { HypixelResourcesModule } from './hypixel-resources';
import { PlayerModule } from './player';
import { SkinModule } from './skin';
import { UserModule } from './user';

@Module({
  imports: [
    TypegooseModule.forRootAsync({
      useFactory: () => ({
        uri: process.env.MONGODB_URI,
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }),
    }),
    RedisModule.forRoot({
      config: {
        url: process.env.REDIS_URL,
      },
    }),
    ScheduleModule.forRoot(),
    PlayerModule,
    GuildModule,
    HypixelResourcesModule,
    SkinModule,
    HistoricalModule,
    AuthModule,
    UserModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
