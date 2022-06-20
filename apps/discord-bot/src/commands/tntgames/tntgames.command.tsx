/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Command } from '@statsify/discord';
import { TNTGamesModes, TNT_GAMES_MODES } from '@statsify/schemas';
import { BaseHypixelCommand, BaseProfileProps } from '../base.hypixel-command';
import { TNTGamesProfile } from './tntgames.profile';

@Command({ description: (t) => t('commands.tntgames') })
export class TNTGamesCommand extends BaseHypixelCommand<TNTGamesModes> {
  public constructor() {
    super(TNT_GAMES_MODES);
  }

  public getProfile(base: BaseProfileProps): JSX.Element {
    return <TNTGamesProfile {...base} />;
  }
}
