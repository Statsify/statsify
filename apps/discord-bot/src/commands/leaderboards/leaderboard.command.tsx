import { ApiService } from '#services';
import { getBackground, getLogo } from '@statsify/assets';
import {
  ActionRowBuilder,
  ButtonBuilder,
  Command,
  CommandContext,
  LocalizeFunction,
  ModalBuilder,
  TextInputBuilder,
} from '@statsify/discord';
import { render } from '@statsify/rendering';
import { ButtonStyle, InteractionResponseType } from 'discord-api-types/v10';
import type { Image } from 'skia-canvas';
import { CommandListener } from '../../command.listener';
import { LeaderboardProfile } from './leaderboard.profile';

@Command({ description: (t) => t('commands.leaderboard') })
export class PlayerLeaderboardCommand {
  public constructor(private readonly apiService: ApiService) {}

  public async run(context: CommandContext) {
    const user = context.getUser();
    const t = context.t();
    const cache = new Map<number, Buffer>();

    const field = 'stats.bedwars.overall.wins';
    let currentPage = 0;

    const [background, logo] = await Promise.all([
      getBackground('hypixel', 'overall'),
      getLogo(user?.premium),
    ]);

    const up = new ButtonBuilder()
      .label('UP')
      .style(ButtonStyle.Secondary)
      .disable(currentPage === 0);

    const down = new ButtonBuilder().label('DOWN').style(ButtonStyle.Secondary);
    const search = new ButtonBuilder().label('SEARCH').style(ButtonStyle.Secondary);

    const listener = CommandListener.getInstance();

    const changePage = (getPage: () => number) => async () => {
      const page = getPage();

      const buffer = await this.getLeaderboard(
        cache,
        field,
        page,
        t,
        background,
        logo,
        user?.premium
      );

      up.disable(page === 0);

      const row = new ActionRowBuilder([up, down, search]);

      context.reply({
        files: [{ name: 'leaderboard.png', data: buffer, type: 'image/png' }],
        components: [row],
        attachments: [],
      });
    };

    listener.addHook(
      up.getCustomId(),
      changePage(() => {
        currentPage -= 1;
        return currentPage;
      })
    );

    listener.addHook(
      down.getCustomId(),
      changePage(() => {
        currentPage += 1;
        return currentPage;
      })
    );

    const playerInput = new TextInputBuilder()
      .label((t) => t('leaderboard.playerInput.label'))
      .placeholder((t) => t('leaderboard.playerInput.placeholder'))
      .required(false);

    const positionInput = new TextInputBuilder()
      .label((t) => t('leaderboard.positionInput.label'))
      .placeholder((t) => t('leaderboard.positionInput.placeholder'))
      .required(false);

    const modal = new ModalBuilder()
      .title((t) => t('leaderboard.modal.title'))
      .component(new ActionRowBuilder([playerInput]))
      .component(new ActionRowBuilder([positionInput]));

    listener.addHook(search.getCustomId(), () => ({
      type: InteractionResponseType.Modal,
      data: modal.build(t),
    }));

    listener.addHook(modal.getCustomId(), async (interaction) => {
      const data = interaction.getData();

      const playerInput = data.components[0].components[0].value;
      const positionInput = data.components[1].components[0].value;

      interaction.sendFollowup({
        content: 'You searched for ' + playerInput + ' at position ' + positionInput,
      });
    });

    const row = new ActionRowBuilder([up, down, search]);

    const buffer = await this.getLeaderboard(
      cache,
      field,
      currentPage,
      t,
      background,
      logo,
      user?.premium
    );

    return {
      files: [{ name: 'leaderboard.png', data: buffer, type: 'image/png' }],
      components: [row],
    };
  }

  private async getLeaderboard(
    cache: Map<number, Buffer>,
    field: string,
    page: number,
    t: LocalizeFunction,
    background: Image,
    logo: Image,
    premium?: boolean
  ): Promise<Buffer> {
    if (cache.has(page)) return cache.get(page)!;

    const buffer = await this.fetchLeaderboard(field, page, t, background, logo, premium);

    cache.set(page, buffer);

    return buffer;
  }

  private async fetchLeaderboard(
    field: string,
    page: number,
    t: LocalizeFunction,
    background: Image,
    logo: Image,
    premium?: boolean
  ) {
    const leaderboard = await this.apiService.getPlayerLeaderboard(field, page);

    const leaderboardData = await Promise.all(
      leaderboard.data.map(async (d) => ({
        ...d,
        skin: await this.apiService.getPlayerHead(d.uuid, 24),
      }))
    );

    const canvas = render(
      <LeaderboardProfile
        background={background}
        logo={logo}
        premium={premium}
        fieldName={leaderboard.fieldName}
        additionalFieldNames={leaderboard.additionalFieldNames}
        data={leaderboardData}
        t={t}
      />
    );

    const buffer = await canvas.toBuffer('png');

    return buffer;
  }
}
