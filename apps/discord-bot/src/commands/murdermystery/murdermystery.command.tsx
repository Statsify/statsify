/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Command } from '@statsify/discord';
import { MurderMysteryModes, MURDER_MYSTERY_MODES } from '@statsify/schemas';
import { BaseHypixelCommand, BaseProfileProps } from '../base.hypixel-command';
import { MurderMysteryProfile } from './murdermystery.profile';

@Command({ description: (t) => t('commands.murdermystery') })
export class MurderMysteryCommand extends BaseHypixelCommand<MurderMysteryModes> {
  public constructor() {
    super(MURDER_MYSTERY_MODES);
  }

  public getProfile(base: BaseProfileProps): JSX.Element {
    return <MurderMysteryProfile {...base} />;
  }
}
