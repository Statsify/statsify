/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Command } from '@statsify/discord';
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
  ): JSX.Element {
    return <SpeedUHCProfile {...base} mode={mode} />;
  }
}
