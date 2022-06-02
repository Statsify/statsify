import { BaseProfileProps } from '#profiles/base.profile';
import { UHCProfile } from '#profiles/uhc.profile';
import { Command } from '@statsify/discord';
import { JSX } from '@statsify/rendering';
import { UHCModes, UHC_MODES } from '@statsify/schemas';
import { BaseHypixelCommand, ProfileData } from './base.hypixel-command';

@Command({ description: (t) => t('commands.uhc') })
export class UHCCommand extends BaseHypixelCommand<UHCModes> {
  public constructor() {
    super(UHC_MODES);
  }

  public getProfile(
    base: BaseProfileProps,
    { mode }: ProfileData<UHCModes, never>
  ): JSX.ElementNode {
    return <UHCProfile {...base} mode={mode} />;
  }
}
