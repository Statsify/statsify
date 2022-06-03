import { Command } from '@statsify/discord';
import { JSX } from '@statsify/rendering';
import { SkyWarsModes, SKYWARS_MODES } from '@statsify/schemas';
import { BaseHypixelCommand, BaseProfileProps, ProfileData } from '../base.hypixel-command';
import { SkyWarsProfile } from './skywars.profile';

@Command({ description: (t) => t('commands.skywars') })
export class SkyWarsCommand extends BaseHypixelCommand<SkyWarsModes> {
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
