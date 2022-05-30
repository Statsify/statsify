import { BaseProfileProps } from '#profiles/base.profile';
import { BedWarsProfile } from '#profiles/bedwars.profile';
import { Command } from '@statsify/discord';
import { JSX } from '@statsify/rendering';
import { BedWarsModes, BEDWARS_MODES } from '@statsify/schemas';
import { HypixelCommand, ProfileData } from './base.hypixel-command';

@Command({ description: (t) => t('commands.bedwars') })
export class BedWarsCommand extends HypixelCommand<BedWarsModes> {
  public constructor() {
    super(BEDWARS_MODES);
  }

  public getProfile(
    base: BaseProfileProps,
    { mode }: ProfileData<BedWarsModes, never>
  ): JSX.ElementNode {
    return <BedWarsProfile {...base} mode={mode} />;
  }
}
