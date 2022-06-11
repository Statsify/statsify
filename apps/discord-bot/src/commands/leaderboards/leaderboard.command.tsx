import { ApiService } from '#services';
import { LeaderboardQuery } from '@statsify/api-client';
import { getBackground, getLogo } from '@statsify/assets';
import {
  ActionRowBuilder,
  ButtonBuilder,
  Command,
  CommandContext,
  IMessage,
  Interaction,
  LocalizeFunction,
  ModalBuilder,
  TextInputBuilder,
} from '@statsify/discord';
import { render } from '@statsify/rendering';
import { ButtonStyle, InteractionResponseType } from 'discord-api-types/v10';
import type { Image } from 'skia-canvas';
import { CommandListener } from '../../command.listener';
import { ErrorMessage } from '../../error.message';
import { LeaderboardProfile } from './leaderboard.profile';

interface BaseLeaderboardProps {
  t: LocalizeFunction;
  background: Image;
  logo: Image;
  premium?: boolean;
}

interface LeaderboardParams {
  input: string | number;
  type: LeaderboardQuery;
}

@Command({ description: (t) => t('commands.leaderboard') })
export class PlayerLeaderboardCommand {
  public constructor(private readonly apiService: ApiService) {}

  public async run(context: CommandContext) {
    const userId = context.getInteraction().getUserId();
    const user = context.getUser();
    const t = context.t();
    const cache = new Map<number, IMessage>();

    const field = 'stats.bedwars.overall.wins';
    let currentPage = 0;

    const [background, logo] = await Promise.all([
      getBackground('hypixel', 'overall'),
      getLogo(user?.premium),
    ]);

    const props: BaseLeaderboardProps = {
      t,
      background,
      logo,
      premium: user?.premium,
    };

    const up = new ButtonBuilder()
      .emoji('<:up:985251630645665832>')
      .style(ButtonStyle.Success)
      .disable(true);

    const down = new ButtonBuilder().emoji('<:down:985251631962660926>').style(ButtonStyle.Danger);

    const search = new ButtonBuilder()
      .emoji('<:search:985251631576801351>')
      .style(ButtonStyle.Primary);

    const changePage = (fn: () => LeaderboardParams) => async (interaction: Interaction) => {
      const params = fn();
      const [message, page] = await this.getLeaderboard(cache, field, params, props);

      if (interaction.getUserId() === userId && !message.ephemeral) {
        up.disable(page === 0);
        currentPage = page || currentPage;
        const row = new ActionRowBuilder([up, down, search]);

        context.reply({
          ...message,
          components: [row],
          attachments: [],
        });
      } else {
        interaction.sendFollowup({ ...message, ephemeral: true });
      }
    };

    const listener = CommandListener.getInstance();

    listener.addHook(
      up.getCustomId(),
      changePage(() => ({
        input: currentPage - 1,
        type: LeaderboardQuery.PAGE,
      }))
    );

    listener.addHook(
      down.getCustomId(),
      changePage(() => ({
        input: currentPage + 1,
        type: LeaderboardQuery.PAGE,
      }))
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

      changePage(() =>
        playerInput
          ? { input: playerInput, type: LeaderboardQuery.PLAYER }
          : { input: positionInput, type: LeaderboardQuery.POSITION }
      )(interaction);
    });

    const row = new ActionRowBuilder([up, down, search]);

    const [message, page] = await this.getLeaderboard(
      cache,
      field,
      { input: currentPage, type: LeaderboardQuery.PAGE },
      props
    );

    setTimeout(() => {
      listener.removeHook(up.getCustomId());
      listener.removeHook(down.getCustomId());
      listener.removeHook(search.getCustomId());
      listener.removeHook(modal.getCustomId());

      context.reply({
        ...cache.get(currentPage)!,
        embeds: [],
        components: [],
        attachments: [],
      });
    }, 300_000);

    // eslint-disable-next-line require-atomic-updates
    currentPage = page || currentPage;

    return { ...message, components: [row] };
  }

  private async getLeaderboard(
    cache: Map<number, IMessage>,
    field: string,
    params: LeaderboardParams,
    props: BaseLeaderboardProps
  ): Promise<[message: IMessage, page: number | null]> {
    if (params.type === LeaderboardQuery.PAGE && cache.has(params.input as number)) {
      const page = params.input as number;
      return [cache.get(page)!, page];
    }

    const [message, page] = await this.fetchLeaderboard(field, params, props);

    if (params.type === LeaderboardQuery.PAGE && page) cache.set(page, message);

    return [message, page];
  }

  private async fetchLeaderboard(
    field: string,
    params: LeaderboardParams,
    props: BaseLeaderboardProps
  ): Promise<[message: IMessage, page: number | null]> {
    const leaderboard = await this.apiService.getPlayerLeaderboard(
      field,
      params.input,
      params.type
    );

    if (!leaderboard || !leaderboard?.data.length) {
      const message = {
        ...new ErrorMessage(
          (t) => t('leaderboard.error.title'),
          (t) => t('leaderboard.error.description')
        ),
        ephemeral: true,
      };

      return [message, null];
    }

    const leaderboardData = await Promise.all(
      leaderboard.data.map(async (d) => ({
        ...d,
        skin: await this.apiService.getPlayerHead(d.uuid, 24),
      }))
    );

    const canvas = render(
      <LeaderboardProfile
        {...props}
        name={leaderboard.name}
        fields={leaderboard.fields}
        data={leaderboardData}
      />
    );

    const buffer = await canvas.toBuffer('png');

    const message = {
      files: [{ name: 'leaderboard.png', data: buffer, type: 'image/png' }],
      embeds: [],
    };

    return [message, leaderboard.page];
  }
}
