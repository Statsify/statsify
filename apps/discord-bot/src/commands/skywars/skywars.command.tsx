import { Command } from '@statsify/discord';
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
  ): JSX.Element {
    return <SkyWarsProfile {...base} mode={mode} />;
  }
}
