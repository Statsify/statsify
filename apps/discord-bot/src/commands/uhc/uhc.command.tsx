/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

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
