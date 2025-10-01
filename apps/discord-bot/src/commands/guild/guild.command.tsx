/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  ApiService,
  Command,
  CommandContext,
  ErrorMessage,
  GuildArgument,
  IMessage,
  PaginateService,
  PlayerArgument,
  SubCommand,
} from "@statsify/discord";
import { GuildListProfile, GuildListProfileProps } from "./guild-list.profile.js";
import { GuildMember } from "@statsify/schemas";
import { GuildMemberProfile } from "./guild-member.profile.js";
import { GuildProfile, GuildProfileProps } from "./guild.profile.js";
import { GuildQuery } from "@statsify/api-client";
import { GuildTopSubCommand } from "./guild-top.subcommand.js";
import { getAllGameIcons, getBackground, getLogo } from "@statsify/assets";
import { getTheme } from "#themes";
import { render } from "@statsify/rendering";

@Command({ description: (t) => t("commands.guild") })
export class GuildCommand extends GuildTopSubCommand {
  public constructor(
    protected readonly apiService: ApiService,
    private readonly paginateService: PaginateService
  ) {
    super(apiService);
  }

  @SubCommand({ description: (t) => t("commands.guild-overall"), args: GuildArgument })
  public async overall(context: CommandContext) {
    const user = context.getUser();
    const t = context.t();

    const guild = await this.getGuild(context);

    const guildMaster = guild.members.find((m) => GuildMember.isGuildMaster(m));

    if (!guildMaster) throw new ErrorMessage("errors.unknown");
    const theme = getTheme(user);

    const [gameIcons, guildRanking, skin, logo, background] = await Promise.all([
      getAllGameIcons(),
      this.apiService.getGuildRankings(["exp"], guild.id),
      this.apiService.getPlayerHead(guildMaster.uuid, 16),
      getLogo(user),
      getBackground("hypixel", "overall", theme?.context.boxColorId ?? "orange"),
    ]);

    const ranking = guildRanking[0]?.rank ?? 0;

    const props: Omit<GuildProfileProps, "page"> = {
      guild,
      guildMaster,
      skin,
      background,
      ranking,
      logo,
      user,
      t,
      gameIcons,
    };

    return this.paginateService.paginate(context, [
      {
        label: "Overall",
        generator: () =>
          render(<GuildProfile {...props} page="overall" />, theme),
      },
      {
        label: "GEXP",
        generator: () => render(<GuildProfile {...props} page="gexp" />, theme),
      },
      {
        label: "GEXP Per Game",
        generator: () =>
          render(<GuildProfile {...props} page="expPerGame" />, theme),
      },
      {
        label: "Misc",
        generator: () => render(<GuildProfile {...props} page="misc" />, theme),
      },
    ]);
  }

  @SubCommand({ description: (t) => t("commands.guild-list"), args: GuildArgument })
  public async list(context: CommandContext): Promise<IMessage> {
    const user = context.getUser();
    const t = context.t();

    const guild = await this.getGuild(context);
    const theme = getTheme(user);

    const [logo, background] = await Promise.all([
      getLogo(user),
      getBackground("hypixel", "overall", theme?.context.boxColorId ?? "orange"),
    ]);

    const props: GuildListProfileProps = {
      guild,
      background,
      logo,
      user,
      t,
    };

    const canvas = render(<GuildListProfile {...props} />, theme);
    const buffer = await canvas.toBuffer("png");

    return {
      files: [{ name: "guild-list.png", data: buffer, type: "image/png" }],
    };
  }

  @SubCommand({ description: (t) => t("commands.guild-member"), args: [PlayerArgument] })
  public async member(context: CommandContext): Promise<IMessage> {
    const user = context.getUser();
    const t = context.t();

    const player = await this.apiService.getPlayer(context.option("player"), user);

    const guild = await this.apiService.getGuild(
      player.guildId || player.uuid,
      player.guildId ? GuildQuery.ID : GuildQuery.PLAYER
    );

    const theme = getTheme(user);

    const [skin, badge, logo, background] = await Promise.all([
      this.apiService.getPlayerSkin(player.uuid, user),
      this.apiService.getUserBadge(player.uuid),
      getLogo(user),
      getBackground("hypixel", "overall", theme?.context.boxColorId ?? "orange"),
    ]);

    const canvas = render(
      <GuildMemberProfile
        logo={logo}
        skin={skin}
        player={player}
        guild={guild}
        background={background}
        t={t}
        badge={badge}
        user={user}
      />,
      theme
    );

    const buffer = await canvas.toBuffer("png");

    return {
      files: [{ name: "guild-member.png", data: buffer, type: "image/png" }],
    };
  }
}
