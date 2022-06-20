/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Command } from '@statsify/discord';
import { QuakeModes, QUAKE_MODES } from '@statsify/schemas';
import { BaseHypixelCommand, BaseProfileProps, ProfileData } from '../base.hypixel-command';
import { QuakeProfile } from './quake.profile';

@Command({ description: (t) => t('commands.quake') })
export class QuakeCommand extends BaseHypixelCommand<QuakeModes> {
  public constructor() {
    super(QUAKE_MODES);
  }

  public getProfile(base: BaseProfileProps, { mode }: ProfileData<QuakeModes, never>): JSX.Element {
    return <QuakeProfile {...base} mode={mode} />;
  }
}
