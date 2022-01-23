import { HypixelModule } from '#hypixel/hypixel.module';
import { PlayerModule } from '#player/player.module';
import { TypegooseModule } from '@m8a/nestjs-typegoose';
import { Module } from '@nestjs/common';
import { Guild } from '@statsify/schemas';
import { GuildController } from './guild.controller';
import { GuildService } from './guild.service';

@Module({
  imports: [HypixelModule, PlayerModule, TypegooseModule.forFeature([Guild])],
  controllers: [GuildController],
  providers: [GuildService],
})
export class GuildModule {}
