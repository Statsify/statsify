import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { HypixelService } from './hypixel.service';

@Module({
  imports: [
    HttpModule.register({
      baseURL: `https://api.hypixel.net/`,
      headers: {
        'API-Key': process.env.HYPIXEL_API_KEY as string,
      },
      timeout: Number(process.env.HYPIXEL_API_TIMEOUT) ?? 5000,
    }),
  ],
  providers: [HypixelService],
  exports: [HypixelService],
})
export class HypixelModule {}
