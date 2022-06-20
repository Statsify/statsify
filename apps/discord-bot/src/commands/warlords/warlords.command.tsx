/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

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
