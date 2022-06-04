import { Command } from '@statsify/discord';
import { BedWarsModes, BEDWARS_MODES } from '@statsify/schemas';
import { BaseHypixelCommand, BaseProfileProps, ProfileData } from '../base.hypixel-command';
import { BedWarsProfile } from './bedwars.profile';

@Command({ description: (t) => t('commands.bedwars') })
export class BedWarsCommand extends BaseHypixelCommand<BedWarsModes> {
  public constructor() {
    super(BEDWARS_MODES);
  }

  public getProfile(
    base: BaseProfileProps,
    { mode }: ProfileData<BedWarsModes, never>
  ): JSX.Element {
    return <BedWarsProfile {...base} mode={mode} />;
  }
}
