/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  ApiService,
  ButtonBuilder,
  Choice,
  ChoiceArgument,
  Command,
  CommandContext,
  ErrorMessage,
  PaginateService,
  PlayerArgument,
} from "@statsify/discord";
import { ButtonStyle } from "discord-api-types/v10";
import {
  GENERAL_MODES,
  LeaderboardScanner,
  Player,
  PlayerStats,
  UserTier,
} from "@statsify/schemas";
import { RankingsProfile } from "./rankings.profile";
import { arrayGroup } from "@statsify/util";
import { games } from "./games";
import { getBackground, getLogo } from "@statsify/assets";
import { getTheme } from "#themes";
import { mapBackground } from "#constants";
import { render } from "@statsify/rendering";

const fields = LeaderboardScanner.getLeaderboardFields(Player);

const choices = games.map((g) => [g.name, g.key] as Choice);
choices.unshift(["All", "all"]);

@Command({
  description: (t) => t("commands.rankings"),
  tier: UserTier.IRON,
  args: [
    new ChoiceArgument({
      name: "game",
      choices,
      required: true,
    }),
    PlayerArgument,
  ],
})
export class RankingsCommand {
  public constructor(
    private readonly apiService: ApiService,
    private readonly paginateService: PaginateService
  ) {}

  public async run(context: CommandContext) {
    const user = context.getUser();
    const t = context.t();

    const player = await this.apiService.getPlayer(context.option("player"), user);

    let game = context.option<keyof PlayerStats | "all" | null>("game");
    if (game === "all") game = null;

    const filteredFields = game
      ? fields.filter((f) => f.startsWith(`stats.${game}`))
      : fields;

    const rankings = await this.apiService.getPlayerRankings(filteredFields, player.uuid);

    if (!rankings.length)
      throw new ErrorMessage(
        (t) => t("errors.noRankings.title"),
        (t) =>
          t("errors.noRankings.description", {
            displayName: this.apiService.emojiDisplayName(t, player.displayName),
          })
      );

    const [skin, badge, logo, background] = await Promise.all([
      this.apiService.getPlayerSkin(player.uuid),
      this.apiService.getUserBadge(player.uuid),
      getLogo(user),
      getBackground(...mapBackground(GENERAL_MODES, "overall")),
    ]);

    const groups = arrayGroup(
      rankings.sort((a, b) => a.rank - b.rank),
      10
    );

    const formattedGame = game ? games.find((g) => g.key === game)?.formatted : undefined;

    return this.paginateService.scrollingPagination(
      context,
      groups.map(
        (group) => () =>
          render(
            <RankingsProfile
              background={background}
              data={group}
              logo={logo}
              badge={badge}
              player={player}
              skin={skin}
              t={t}
              user={user}
              game={formattedGame}
            />,
            getTheme(user)
          )
      ),
      new ButtonBuilder().emoji(t("emojis:up")).style(ButtonStyle.Success),
      new ButtonBuilder().emoji(t("emojis:down")).style(ButtonStyle.Danger),
      true
    );
  }
}
