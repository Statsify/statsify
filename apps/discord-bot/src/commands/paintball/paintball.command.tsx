/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Command } from '@statsify/discord';
import { PaintballModes, PAINTBALL_MODES } from '@statsify/schemas';
import { BaseHypixelCommand, BaseProfileProps } from '../base.hypixel-command';
import { PaintballProfile } from './paintball.profile';

@Command({ description: (t) => t('commands.paintball') })
export class PaintballCommand extends BaseHypixelCommand<PaintballModes> {
  public constructor() {
    super(PAINTBALL_MODES);
  }

  public getProfile(base: BaseProfileProps): JSX.Element {
    return <PaintballProfile {...base} />;
  }
}
