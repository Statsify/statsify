import { BaseProfileProps } from '#profiles/base.profile';
import { WoolWarsProfile } from '#profiles/woolwars.profile';
import { Command } from '@statsify/discord';
import { JSX } from '@statsify/rendering';
import { WoolWarsModes, WOOL_WARS_MODES } from '@statsify/schemas';
import { BaseHypixelCommand, ProfileData } from './base.hypixel-command';

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
