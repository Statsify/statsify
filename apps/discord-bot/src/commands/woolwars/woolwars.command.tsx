import { Command } from '@statsify/discord';
import { JSX } from '@statsify/rendering';
import { WoolWarsModes, WOOL_WARS_MODES } from '@statsify/schemas';
import { BaseHypixelCommand, BaseProfileProps, ProfileData } from '../base.hypixel-command';
import { WoolWarsProfile } from './woolwars.profile';

@Command({ description: (t) => t('commands.woolwars') })
export class WoolWarsCommand extends BaseHypixelCommand<WoolWarsModes> {
  public constructor() {
    super(WOOL_WARS_MODES);
  }

  public getProfile(
    base: BaseProfileProps,
    { mode }: ProfileData<WoolWarsModes, never>
  ): JSX.ElementNode {
    return <WoolWarsProfile {...base} mode={mode} />;
  }
}
