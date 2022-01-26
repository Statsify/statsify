import { GuildModule } from '#guild/guild.module';
import { HypixelResourcesModule } from '#hypixel-resources/hypixel-resources.module';
import { LeaderboardModule } from '#leaderboards/leaderboard.module';
import { PlayerModule } from '#player/player.module';
import { SkinModule } from '#skin/skin.module';
import { TypegooseModule } from '@m8a/nestjs-typegoose';
import { RedisModule } from '@nestjs-modules/ioredis';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';

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
    PlayerModule,
    GuildModule,
    HypixelResourcesModule,
    SkinModule,
    LeaderboardModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
