import { Command } from '@statsify/discord';
import { JSX } from '@statsify/rendering';
import { SpeedUHCModes, SPEED_UHC_MODES } from '@statsify/schemas';
import { BaseHypixelCommand, BaseProfileProps, ProfileData } from '../base.hypixel-command';
import { SpeedUHCProfile } from './speeduhc.profile';

@Command({ description: (t) => t('commands.speeduhc') })
export class SpeedUHCCommand extends BaseHypixelCommand<SpeedUHCModes> {
  public constructor() {
    super(SPEED_UHC_MODES);
  }

  public getProfile(
    base: BaseProfileProps,
    { mode }: ProfileData<SpeedUHCModes, never>
  ): JSX.ElementNode {
    return <SpeedUHCProfile {...base} mode={mode} />;
  }
}
