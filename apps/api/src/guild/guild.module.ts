import { TypegooseModule } from '@m8a/nestjs-typegoose';
import { Module } from '@nestjs/common';
import { Guild } from '@statsify/schemas';
import { HypixelModule } from '../hypixel/hypixel.module';
import { GuildController } from './guild.controller';
import { GuildService } from './guild.service';

@Module({
  imports: [HypixelModule, TypegooseModule.forFeature([Guild])],
  controllers: [GuildController],
  providers: [GuildService],
})
export class GuildModule {}
