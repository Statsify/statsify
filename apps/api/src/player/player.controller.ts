import { Controller, Get } from '@nestjs/common';
import { PlayerService } from './player.service';

@Controller('/player')
export class PlayerController {
  public constructor(private readonly playerService: PlayerService) {}

  @Get()
  public getPlayer(tag: string) {
    return this.playerService.findOne(tag);
  }
}
