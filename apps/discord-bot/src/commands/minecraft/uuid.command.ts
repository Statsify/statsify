/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { MojangPlayerArgument } from '#arguments';
import { INFO_COLOR } from '#constants';
import { MojangApiService } from '#services';
import { Command, CommandContext, EmbedBuilder } from '@statsify/discord';
import short from 'short-uuid';

@Command({ description: 'commands.uuid', args: [new MojangPlayerArgument()] })
export class UUIDCommand {
  public constructor(private readonly mojangApiService: MojangApiService) {}

  public async run(context: CommandContext) {
    const user = context.getUser();

    const player = await this.mojangApiService.getPlayer(context.option<string>('player'), user);

    const thumbURL = this.mojangApiService.faceIconUrl(player.uuid);
    const shortUuid = short(short.constants.cookieBase90).fromUUID(player.uuid);

    const embed = new EmbedBuilder()
      .field((t) => t('embeds.uuid.description.username'), `\`${player.username}\``)
      .field((t) => t('embeds.uuid.description.uuid'), `\`${player.uuid}\``)
      .field(
        (t) => t('embeds.uuid.description.trimmedUUID'),
        `\`${player.uuid.replace(/-/g, '')}\``
      )
      .field((t) => t('embeds.uuid.description.shortUUID'), shortUuid.replace(/`/g, '\\`'))
      .color(INFO_COLOR)
      .thumbnail(thumbURL);

    return { embeds: [embed] };
  }
}
