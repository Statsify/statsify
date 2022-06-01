import { BaseProfileProps } from '#profiles/base.profile';
import { DuelsProfile } from '#profiles/duels.profile';
import { Command } from '@statsify/discord';
import { JSX } from '@statsify/rendering';
import { DuelsModes, DUELS_MODES } from '@statsify/schemas';
import { BaseHypixelCommand, ProfileData } from './base.hypixel-command';

@Command({ description: (t) => t('commands.duels') })
export class DuelsCommand extends BaseHypixelCommand<DuelsModes> {
  public constructor() {
    super(DUELS_MODES);
  }

  public getProfile(base: BaseProfileProps, { mode }: ProfileData<DuelsModes>): JSX.ElementNode {
    return <DuelsProfile {...base} mode={mode} />;
  }
}
