/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Command } from '@statsify/discord';
import { ArenaBrawlModes, ARENA_BRAWL_MODES } from '@statsify/schemas';
import { BaseHypixelCommand, BaseProfileProps, ProfileData } from '../base.hypixel-command';
import { ArenaBrawlProfile } from './arenabrawl.profile';

@Command({ description: (t) => t('commands.arenabrawl') })
export class ArenaBrawlCommand extends BaseHypixelCommand<ArenaBrawlModes> {
  public constructor() {
    super(ARENA_BRAWL_MODES);
  }

  public getProfile(
    base: BaseProfileProps,
    { mode }: ProfileData<ArenaBrawlModes, never>
  ): JSX.Element {
    return <ArenaBrawlProfile {...base} mode={mode} />;
  }
}
