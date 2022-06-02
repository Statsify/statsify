import { BaseProfileProps } from '#profiles/base.profile';
import { QuakeProfile } from '#profiles/quake.profile';
import { Command } from '@statsify/discord';
import { JSX } from '@statsify/rendering';
import { QuakeModes, QUAKE_MODES } from '@statsify/schemas';
import { BaseHypixelCommand, ProfileData } from './base.hypixel-command';

@Command({ description: (t) => t('commands.quake') })
export class QuakeCommand extends BaseHypixelCommand<QuakeModes> {
  public constructor() {
    super(QUAKE_MODES);
  }

  public getProfile(
    base: BaseProfileProps,
    { mode }: ProfileData<QuakeModes, never>
  ): JSX.ElementNode {
    return <QuakeProfile {...base} mode={mode} />;
  }
}
