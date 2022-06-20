/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { INFO_COLOR } from '#constants';
import { getLogoPath } from '@statsify/assets';
import { Command, EmbedBuilder, IMessage } from '@statsify/discord';
import { UserTier } from '@statsify/schemas';
import { readFile } from 'fs/promises';

@Command({ description: (t) => t('commands.ping') })
export class PingCommand {
  public async run(): Promise<IMessage> {
    const embed = new EmbedBuilder()
      .title((t) => t('embeds.ping.title'))
      .field(
        (t) => t('embeds.ping.core'),
        '`jacob#5432`, `Codr#0002`, `Mo2men#2806`, `connor#5957`'
      )
      .field((t) => t('embeds.ping.contributors'), '`vnmm#6969`')
      .color(INFO_COLOR)
      .thumbnail('attachment://logo.png');

    const logo = await readFile(getLogoPath(UserTier.NONE, 64));

    return {
      content: (t) => t('embeds.ping.pong'),
      embeds: [embed],
      files: [{ name: 'logo.png', data: logo, type: 'image/png' }],
    };
  }
}
