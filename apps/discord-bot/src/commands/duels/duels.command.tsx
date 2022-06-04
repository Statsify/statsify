import { Command } from '@statsify/discord';
import { DuelsModes, DUELS_MODES } from '@statsify/schemas';
import { BaseHypixelCommand, BaseProfileProps, ProfileData } from '../base.hypixel-command';
import { DuelsProfile } from './duels.profile';

@Command({ description: (t) => t('commands.duels') })
export class DuelsCommand extends BaseHypixelCommand<DuelsModes> {
  public constructor() {
    super(DUELS_MODES);
  }

  public getProfile(base: BaseProfileProps, { mode }: ProfileData<DuelsModes>): JSX.Element {
    return <DuelsProfile {...base} mode={mode} />;
  }
}
