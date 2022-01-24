import { TypegooseModule } from '@m8a/nestjs-typegoose';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { GuildModule } from './guild/guild.module';
import { HypixelResourcesModule } from './hypixel-resources/hypixel-resources.module';
import { PlayerModule } from './player/player.module';
import { SkinModule } from './skin/skin.module';

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
    PlayerModule,
    GuildModule,
    HypixelResourcesModule,
    SkinModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
