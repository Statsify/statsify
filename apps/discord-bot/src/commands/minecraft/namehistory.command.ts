import { MojangPlayerArgument } from '#arguments';
import { INFO_COLOR } from '#constants';
import { ApiService, MojangApiService } from '#services';
import { Command, CommandContext, EmbedBuilder } from '@statsify/discord';
import { ErrorMessage } from '../../error.message';

function unknownError() {
  return new ErrorMessage(
    (t) => t('errors.unknown.title'),
    (t) => t('errors.unknown.description')
  );
}

@Command({ description: 'commands.namehistory', args: [new MojangPlayerArgument()] })
export class NameHistoryCommand {
  public constructor(
    private readonly apiService: ApiService,
    private readonly monjangApiService: MojangApiService
  ) {}

  public async run(context: CommandContext) {
    const user = context.getUser();

    const player = await this.apiService.getWithUser(
      user,
      this.apiService.getPlayer,
      context.option('player')
    );

    const nameHistory = await this.monjangApiService.getNameHistory(player.uuid);

    if (!nameHistory) {
      throw unknownError();
    }

    const thumbURL = `https://crafatar.com/avatars/${player.uuid}?size=160&default=MHF_Steve&overlay&id=c958a4c0ca23485299ffc2cab67aea3e`;

    const name = `${player.username}${player.username.slice(-1) == "s'" ? "'" : "'s"}`;

    const embed = new EmbedBuilder()
      .title((t) => t(`${name} ${t('embeds.namehistory.title')} [${nameHistory.length}]`))
      .description((t) => {
        let description = '';
        for (const { username, changed_at } of nameHistory.reverse()) {
          const time = changed_at
            ? `<t:${Math.floor(new Date(changed_at).getTime() / 1000)}:R>`
            : `\`${t('embeds.namehistory.description.originalName')}\``;

          description += `\`•\` **${username}**: ${time}\n`;
        }

        return description;
      })
      .url(`https://namemc.com/profile/${player.uuid}`)
      .color(INFO_COLOR)
      .thumbnail(thumbURL);

    return {
      embeds: [embed],
    };
  }
}
