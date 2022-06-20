/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Command } from '@statsify/discord';
import { BlitzSGKit, BlitzSGModes, BLITZSG_MODES, Player } from '@statsify/schemas';
import { BaseHypixelCommand, BaseProfileProps, ProfileData } from '../base.hypixel-command';
import { BlitzSGProfile } from './blitzsg.profile';

@Command({ description: (t) => t('commands.blitzsg') })
export class BlitzSGCommand extends BaseHypixelCommand<BlitzSGModes> {
  public constructor() {
    super(BLITZSG_MODES);
  }

  public filterModes(player: Player) {
    const { blitzsg } = player.stats;

    const kits = BLITZSG_MODES.slice(1, -1)
      .sort((a, b) => (blitzsg[b] as BlitzSGKit).exp - (blitzsg[a] as BlitzSGKit).exp)
      .splice(0, 24);

    return ['overall', ...kits];
  }

  public getProfile(
    base: BaseProfileProps,
    { mode }: ProfileData<BlitzSGModes, never>
  ): JSX.Element {
    return <BlitzSGProfile {...base} mode={mode} />;
  }
}
