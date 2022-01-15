import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HypixelService } from './hypixel.service';

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        baseURL: `https://api.hypixel.net/`,
        headers: {
          'API-Key': configService.get<string>('HYPIXEL_API_KEY', ''),
        },
        timeout: configService.get<number>('HYPIXEL_API_TIMEOUT', 5000),
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [HypixelService],
  exports: [HypixelService],
})
export class HypixelModule {}
