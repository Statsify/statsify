import { Command } from '@statsify/discord';
import { UHCModes, UHC_MODES } from '@statsify/schemas';
import { BaseHypixelCommand, BaseProfileProps, ProfileData } from '../base.hypixel-command';
import { UHCProfile } from './uhc.profile';

@Command({ description: (t) => t('commands.uhc') })
export class UHCCommand extends BaseHypixelCommand<UHCModes> {
  public constructor() {
    super(UHC_MODES);
  }

  public getProfile(base: BaseProfileProps, { mode }: ProfileData<UHCModes, never>): JSX.Element {
    return <UHCProfile {...base} mode={mode} />;
  }
}
