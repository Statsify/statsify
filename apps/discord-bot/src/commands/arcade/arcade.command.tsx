/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Command } from '@statsify/discord';
import { ArcadeModes, ARCADE_MODES } from '@statsify/schemas';
import { BaseHypixelCommand, BaseProfileProps, ProfileData } from '../base.hypixel-command';
import { ArcadeProfile } from './arcade.profile';

@Command({ description: (t) => t('commands.arcade') })
export class ArcadeCommand extends BaseHypixelCommand<ArcadeModes> {
  public constructor() {
    super(ARCADE_MODES);
  }

  public getProfile(base: BaseProfileProps, { mode }: ProfileData<ArcadeModes>): JSX.Element {
    return <ArcadeProfile {...base} mode={mode} />;
  }
}
