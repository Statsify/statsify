import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { config } from 'dotenv';
import { HypixelService } from './hypixel.service';

config({ path: '../../.env' });

@Module({
  imports: [
    HttpModule.register({
      baseURL: `https://api.hypixel.net/`,
      headers: {
        'API-Key': process.env.HYPIXEL_API_KEY,
      },
      timeout: Number(process.env.HYPIXEL_API_TIMEOUT) ?? 5000,
    }),
  ],
  providers: [HypixelService],
  exports: [HypixelService],
})
export class HypixelModule {}
