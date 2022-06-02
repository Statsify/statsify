import { BaseProfileProps } from '#profiles/base.profile';
import { WallsProfile } from '#profiles/walls.profile';
import { Command } from '@statsify/discord';
import { JSX } from '@statsify/rendering';
import { WallsModes, WALLS_MODES } from '@statsify/schemas';
import { BaseHypixelCommand } from './base.hypixel-command';

@Command({ description: (t) => t('commands.walls') })
export class WallsCommand extends BaseHypixelCommand<WallsModes> {
  public constructor() {
    super(WALLS_MODES);
  }

  public getProfile(base: BaseProfileProps): JSX.ElementNode {
    return <WallsProfile {...base} />;
  }
}
