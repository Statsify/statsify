import { BaseProfileProps } from '#profiles/base.profile';
import { TNTGamesProfile } from '#profiles/tntgames.profile';
import { Command } from '@statsify/discord';
import { JSX } from '@statsify/rendering';
import { TNTGamesModes, TNT_GAMES_MODES } from '@statsify/schemas';
import { BaseHypixelCommand } from './base.hypixel-command';

@Command({ description: (t) => t('commands.tntgames') })
export class TNTGamesCommand extends BaseHypixelCommand<TNTGamesModes> {
  public constructor() {
    super(TNT_GAMES_MODES);
  }

  public getProfile(base: BaseProfileProps): JSX.ElementNode {
    return <TNTGamesProfile {...base} />;
  }
}
