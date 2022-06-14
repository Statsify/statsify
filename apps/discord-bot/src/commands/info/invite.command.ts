import { INFO_COLOR } from '#constants';
import { getLogoPath } from '@statsify/assets';
import { Command, EmbedBuilder, IMessage } from '@statsify/discord';
import { UserTier } from '@statsify/schemas';
import { readFile } from 'fs/promises';

@Command({ description: (t) => t('commands.info') })
export class InviteCommand {
  public async run(): Promise<IMessage> {
    const embed = new EmbedBuilder()
      .title((t) => t('embeds.invite.title'))
      .color(INFO_COLOR)
      .description((t) => {
        const description = t('embeds.invite.description');

        const links = [
          `**${t('socials.invite', { id: process.env.DISCORD_BOT_APPLICATION_ID })}**`,
          t('socials.discord'),
          t('socials.premium'),
          t('socials.website'),
          t('socials.github'),
          t('socials.forums'),
        ]
          .map((link) => `\`•\` ${link}`)
          .join('\n');

        return `${description}\n\n${links}`;
      })
      .thumbnail('attachment://logo.png');

    const logo = await readFile(getLogoPath(UserTier.NONE, 64));

    return { embeds: [embed], files: [{ name: 'logo.png', data: logo, type: 'image/png' }] };
  }
}
