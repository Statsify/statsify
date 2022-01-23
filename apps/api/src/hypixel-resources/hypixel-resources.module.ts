import { HypixelModule } from '#hypixel/hypixel.module';
import { Module } from '@nestjs/common';
import { HypixelResourcesController } from './hypixel-resources.controller';

@Module({
  imports: [HypixelModule],
  controllers: [HypixelResourcesController],
})
export class HypixelResourcesModule {}
