/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Command } from '@statsify/discord';
import { VampireZModes, VAMPIREZ_MODES } from '@statsify/schemas';
import { BaseHypixelCommand, BaseProfileProps } from '../base.hypixel-command';
import { VampireZProfile } from './vampirez.profile';

@Command({ description: (t) => t('commands.vampirez') })
export class VampireZCommand extends BaseHypixelCommand<VampireZModes> {
  public constructor() {
    super(VAMPIREZ_MODES);
  }

  public getProfile(base: BaseProfileProps): JSX.Element {
    return <VampireZProfile {...base} />;
  }
}
