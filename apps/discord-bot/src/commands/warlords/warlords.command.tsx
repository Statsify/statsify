import { Command } from '@statsify/discord';
import { WarlordsModes, WARLORDS_MODES } from '@statsify/schemas';
import { BaseHypixelCommand, BaseProfileProps, ProfileData } from '../base.hypixel-command';
import { WarlordsProfile } from './warlords.profile';

@Command({ description: (t) => t('commands.warlords') })
export class WarlordsCommand extends BaseHypixelCommand<WarlordsModes> {
  public constructor() {
    super(WARLORDS_MODES);
  }

  public getProfile(
    base: BaseProfileProps,
    { mode }: ProfileData<WarlordsModes, never>
  ): JSX.Element {
    return <WarlordsProfile {...base} mode={mode} />;
  }
}
