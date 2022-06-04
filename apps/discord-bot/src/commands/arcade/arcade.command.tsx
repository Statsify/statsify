import { Command } from '@statsify/discord';
import { JSX } from '@statsify/rendering';
import { ArcadeModes, ARCADE_MODES } from '@statsify/schemas';
import { BaseHypixelCommand, BaseProfileProps, ProfileData } from '../base.hypixel-command';
import { ArcadeProfile } from './arcade.profile';

@Command({ description: (t) => t('commands.arcade') })
export class ArcadeCommand extends BaseHypixelCommand<ArcadeModes> {
  public constructor() {
    super(ARCADE_MODES);
  }

  public getProfile(base: BaseProfileProps, { mode }: ProfileData<ArcadeModes>): JSX.ElementNode {
    return <ArcadeProfile {...base} mode={mode} />;
  }
}
