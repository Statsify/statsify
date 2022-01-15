import { Controller } from '@nestjs/common';
import { PlayerService } from './player.service';

@Controller('/player')
export class PlayerController {
  public constructor(private readonly playerService: PlayerService) {}
}
