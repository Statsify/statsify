/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { PlayerLeaderboardArgument } from '#arguments';
import { GamesWithBackgrounds, mapBackground } from '#constants';
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
  SubCommand,
  TextInputBuilder,
} from '@statsify/discord';
import { render } from '@statsify/rendering';
import {
  ARCADE_MODES,
  ARENA_BRAWL_MODES,
  BEDWARS_MODES,
  BLITZSG_MODES,
  BUILD_BATTLE_MODES,
  COPS_AND_CRIMS_MODES,
  DUELS_MODES,
  GENERAL_MODES,
  MEGAWALLS_MODES,
  MURDER_MYSTERY_MODES,
  PAINTBALL_MODES,
  PARKOUR_MODES,
  PlayerStats,
  QUAKE_MODES,
  SKYWARS_MODES,
  SMASH_HEROES_MODES,
  SPEED_UHC_MODES,
  TNT_GAMES_MODES,
  TURBO_KART_RACERS_MODES,
  UHC_MODES,
  UserTier,
  VAMPIREZ_MODES,
  WALLS_MODES,
  WARLORDS_MODES,
  WOOL_WARS_MODES,
} from '@statsify/schemas';
import { ButtonStyle, InteractionResponseType } from 'discord-api-types/v10';
import type { Image } from 'skia-canvas';
import { CommandListener } from '../../command.listener';
import { ErrorMessage } from '../../error.message';
import { LeaderboardProfile } from './leaderboard.profile';

interface BaseLeaderboardProps {
  t: LocalizeFunction;
  background: Image;
  logo: Image;
  tier?: UserTier;
}

interface LeaderboardParams {
  input: string | number;
  type: LeaderboardQuery;
}

@Command({ description: (t) => t('commands.leaderboard') })
export class LeaderboardCommand {
  public constructor(private readonly apiService: ApiService) {}

  @SubCommand({
    description: (t) => t('commands.arcade'),
    args: [new PlayerLeaderboardArgument('arcade')],
  })
  public arcade(context: CommandContext) {
    return this.run(context, 'arcade', ARCADE_MODES);
  }

  @SubCommand({
    description: (t) => t('commands.arenabrawl'),
    args: [new PlayerLeaderboardArgument('arenabrawl')],
  })
  public arenabrawl(context: CommandContext) {
    return this.run(context, 'arenabrawl', ARENA_BRAWL_MODES);
  }

  @SubCommand({
    description: (t) => t('commands.bedwars'),
    args: [new PlayerLeaderboardArgument('bedwars')],
  })
  public bedwars(context: CommandContext) {
    return this.run(context, 'bedwars', BEDWARS_MODES);
  }

  @SubCommand({
    description: (t) => t('commands.blitzsg'),
    args: [new PlayerLeaderboardArgument('blitzsg')],
  })
  public blitzsg(context: CommandContext) {
    return this.run(context, 'blitzsg', BLITZSG_MODES);
  }

  @SubCommand({
    description: (t) => t('commands.buildbattle'),
    args: [new PlayerLeaderboardArgument('buildbattle')],
  })
  public buildbattle(context: CommandContext) {
    return this.run(context, 'buildbattle', BUILD_BATTLE_MODES);
  }

  @SubCommand({
    description: (t) => t('commands.copsandcrims'),
    args: [new PlayerLeaderboardArgument('copsandcrims')],
  })
  public copsandcrims(context: CommandContext) {
    return this.run(context, 'copsandcrims', COPS_AND_CRIMS_MODES);
  }

  @SubCommand({
    description: (t) => t('commands.duels'),
    args: [new PlayerLeaderboardArgument('duels')],
  })
  public duels(context: CommandContext) {
    return this.run(context, 'duels', DUELS_MODES);
  }

  @SubCommand({
    description: (t) => t('commands.general'),
    args: [new PlayerLeaderboardArgument('general')],
  })
  public general(context: CommandContext) {
    return this.run(context, 'general', GENERAL_MODES);
  }

  @SubCommand({
    description: (t) => t('commands.megawalls'),
    args: [new PlayerLeaderboardArgument('megawalls')],
  })
  public megawalls(context: CommandContext) {
    return this.run(context, 'megawalls', MEGAWALLS_MODES);
  }

  @SubCommand({
    description: (t) => t('commands.murdermystery'),
    args: [new PlayerLeaderboardArgument('murdermystery')],
  })
  public murdermystery(context: CommandContext) {
    return this.run(context, 'murdermystery', MURDER_MYSTERY_MODES);
  }

  @SubCommand({
    description: (t) => t('commands.paintball'),
    args: [new PlayerLeaderboardArgument('paintball')],
  })
  public paintball(context: CommandContext) {
    return this.run(context, 'paintball', PAINTBALL_MODES);
  }

  @SubCommand({
    description: (t) => t('commands.parkour'),
    args: [new PlayerLeaderboardArgument('parkour')],
  })
  public parkour(context: CommandContext) {
    return this.run(context, 'parkour', PARKOUR_MODES);
  }

  @SubCommand({
    description: (t) => t('commands.quake'),
    args: [new PlayerLeaderboardArgument('quake')],
  })
  public quake(context: CommandContext) {
    return this.run(context, 'quake', QUAKE_MODES);
  }

  @SubCommand({
    description: (t) => t('commands.skywars'),
    args: [new PlayerLeaderboardArgument('skywars')],
  })
  public skywars(context: CommandContext) {
    return this.run(context, 'skywars', SKYWARS_MODES);
  }

  @SubCommand({
    description: (t) => t('commands.smashheroes'),
    args: [new PlayerLeaderboardArgument('smashheroes')],
  })
  public smashheroes(context: CommandContext) {
    return this.run(context, 'smashheroes', SMASH_HEROES_MODES);
  }

  @SubCommand({
    description: (t) => t('commands.speeduhc'),
    args: [new PlayerLeaderboardArgument('speeduhc')],
  })
  public speeduhc(context: CommandContext) {
    return this.run(context, 'speeduhc', SPEED_UHC_MODES);
  }

  @SubCommand({
    description: (t) => t('commands.tntgames'),
    args: [new PlayerLeaderboardArgument('tntgames')],
  })
  public tntgames(context: CommandContext) {
    return this.run(context, 'tntgames', TNT_GAMES_MODES);
  }

  @SubCommand({
    description: (t) => t('commands.turbokartracers'),
    args: [new PlayerLeaderboardArgument('turbokartracers')],
  })
  public turbokartracers(context: CommandContext) {
    return this.run(context, 'turbokartracers', TURBO_KART_RACERS_MODES);
  }

  @SubCommand({
    description: (t) => t('commands.uhc'),
    args: [new PlayerLeaderboardArgument('uhc')],
  })
  public uhc(context: CommandContext) {
    return this.run(context, 'uhc', UHC_MODES);
  }

  @SubCommand({
    description: (t) => t('commands.vampirez'),
    args: [new PlayerLeaderboardArgument('vampirez')],
  })
  public vampirez(context: CommandContext) {
    return this.run(context, 'vampirez', VAMPIREZ_MODES);
  }

  @SubCommand({
    description: (t) => t('commands.walls'),
    args: [new PlayerLeaderboardArgument('walls')],
  })
  public walls(context: CommandContext) {
    return this.run(context, 'walls', WALLS_MODES);
  }

  @SubCommand({
    description: (t) => t('commands.warlords'),
    args: [new PlayerLeaderboardArgument('warlords')],
  })
  public warlords(context: CommandContext) {
    return this.run(context, 'warlords', WARLORDS_MODES);
  }

  @SubCommand({
    description: (t) => t('commands.woolwars'),
    args: [new PlayerLeaderboardArgument('woolwars')],
  })
  public woolwars(context: CommandContext) {
    return this.run(context, 'woolwars', WOOL_WARS_MODES);
  }

  private async run<T extends GamesWithBackgrounds>(
    context: CommandContext,
    prefix: keyof PlayerStats,
    modes: T
  ) {
    const userId = context.getInteraction().getUserId();
    const user = context.getUser();
    const t = context.t();
    const cache = new Map<number, IMessage>();

    const leaderboard = context.option<string>('leaderboard');

    const field = `stats.${prefix}.${leaderboard.replace(/ /g, '.')}`;
    let currentPage = 0;

    const [background, logo] = await Promise.all([
      getBackground(...mapBackground(modes, modes[0])),
      getLogo(user?.tier),
    ]);

    const props: BaseLeaderboardProps = {
      t,
      background,
      logo,
      tier: user?.tier,
    };

    const up = new ButtonBuilder().emoji(t('emojis:up')).style(ButtonStyle.Success).disable(true);
    const down = new ButtonBuilder().emoji(t('emojis:down')).style(ButtonStyle.Danger);
    const search = new ButtonBuilder().emoji(t('emojis:search')).style(ButtonStyle.Primary);

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
          ? { input: playerInput, type: LeaderboardQuery.INPUT }
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

      context.reply({ embeds: [], components: [] });
      cache.clear();
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
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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

    if (!leaderboard) {
      const message = {
        ...new ErrorMessage(
          (t) => t('errors.leaderboardPlayerNotFound.title'),
          (t) => t('errors.leaderboardPlayerNotFound.description')
        ),
        ephemeral: true,
      };

      return [message, null];
    }

    if (!leaderboard?.data.length) {
      const message = {
        ...new ErrorMessage(
          (t) => t('errors.leaderboardEmpty.title'),
          (t) => t('errors.leaderboardEmpty.description')
        ),
        ephemeral: true,
      };

      return [message, null];
    }

    const leaderboardData = await Promise.all(
      leaderboard.data.map(async (d) => ({
        ...d,
        skin: await this.apiService.getPlayerHead(d.id, 24),
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
