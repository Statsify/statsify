import { TypegooseModule } from '@m8a/nestjs-typegoose';
import { RedisModule } from '@nestjs-modules/ioredis';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { GuildModule } from './guild';
import { HistoricalModule } from './historical';
import { HypixelResourcesModule } from './hypixel-resources';
import { LeaderboardModule } from './leaderboards';
import { PlayerModule } from './player';
import { SkinModule } from './skin';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: '../../.env' }),
    TypegooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI', ''),
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }),
      inject: [ConfigService],
    }),
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        config: {
          url: configService.get<string>('REDIS_URL', ''),
        },
      }),
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
    PlayerModule,
    GuildModule,
    HypixelResourcesModule,
    SkinModule,
    LeaderboardModule,
    HistoricalModule,
    AuthModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
