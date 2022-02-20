import { Module } from '@nestjs/common';
import { HypixelModule } from '../hypixel';
import { HypixelResourcesController } from './hypixel-resources.controller';

@Module({
  imports: [HypixelModule],
  controllers: [HypixelResourcesController],
})
export class HypixelResourcesModule {}
