import { Command } from '@statsify/discord';
import { JSX } from '@statsify/rendering';
import { WallsModes, WALLS_MODES } from '@statsify/schemas';
import { BaseHypixelCommand, BaseProfileProps } from '../base.hypixel-command';
import { WallsProfile } from './walls.profile';

@Command({ description: (t) => t('commands.walls') })
export class WallsCommand extends BaseHypixelCommand<WallsModes> {
  public constructor() {
    super(WALLS_MODES);
  }

  public getProfile(base: BaseProfileProps): JSX.ElementNode {
    return <WallsProfile {...base} />;
  }
}
