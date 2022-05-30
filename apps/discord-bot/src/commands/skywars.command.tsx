import { BaseProfileProps } from '#profiles/base.profile';
import { SkyWarsProfile } from '#profiles/skywars.profile';
import { Command } from '@statsify/discord';
import { JSX } from '@statsify/rendering';
import { SkyWarsModes, SKYWARS_MODES } from '@statsify/schemas';
import { HypixelCommand, ProfileData } from './base.hypixel-command';

@Command({ description: (t) => t('commands.skywars') })
export class SkyWarsCommand extends HypixelCommand<SkyWarsModes> {
  public constructor() {
    super(SKYWARS_MODES);
  }

  public getProfile(
    base: BaseProfileProps,
    { mode }: ProfileData<SkyWarsModes, never>
  ): JSX.ElementNode {
    return <SkyWarsProfile {...base} mode={mode} />;
  }
}
