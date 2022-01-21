import { Module } from '@nestjs/common';
import { HypixelModule } from '../hypixel/hypixel.module';
import { GuildController } from './guild.controller';
import { GuildService } from './guild.service';

@Module({
  imports: [HypixelModule],
  controllers: [GuildController],
  providers: [GuildService],
})
export class GuildModule {}
