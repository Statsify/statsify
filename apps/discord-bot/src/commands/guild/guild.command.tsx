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
  paginate,
  PlayerArgument,
  SubCommand,
} from "@statsify/discord";
import { GuildListProfile, GuildListProfileProps } from "./guild-list.profile.js";
import { GuildMember } from "@statsify/schemas";
import { GuildMemberProfile } from "./guild-member.profile.js";
import { GuildProfile, GuildProfileProps } from "./guild.profile.js";
import { GuildQuery } from "@statsify/api-client";
import { GuildTopSubCommand } from "./guild-top.subcommand.js";
import { all } from "better-all";
import { getAllGameIcons, getBackground, getLogo } from "@statsify/assets";
import { getTheme } from "#themes";
import { render } from "@statsify/rendering";

@Command({ description: (t) => t("commands.guild") })
export class GuildCommand extends GuildTopSubCommand {
  public constructor(protected readonly apiService: ApiService,) {
    super(apiService);
  }

  @SubCommand({ description: (t) => t("commands.guild-overall"), args: GuildArgument })
  public async overall(context: CommandContext) {
    const user = context.getUser();
    const t = context.t();

    const { apiService } = this;

    const { guild, guildMaster, gameIcons, guildRanking, skin, logo, background } = await all({
      guild: () => this.getGuild(context),
      async guildMaster() {
        const guildMaster = (await this.$.guild).members.find((m) => GuildMember.isGuildMaster(m));

        if (!guildMaster) throw new ErrorMessage("errors.unknown");

        return guildMaster;
      },
      gameIcons: () => getAllGameIcons(),
      async guildRanking() {
        return apiService.getGuildRankings(["exp"], (await this.$.guild).id);
      },
      async skin() {
        return apiService.getPlayerHead((await this.$.guildMaster).uuid, 16);
      },
      logo: () => getLogo(user),
      background: () => getBackground("hypixel", "overall"),
    });

    const ranking = guildRanking[0]?.rank;

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

    return paginate(context, [
      {
        label: "Overall",
        generator: () =>
          render(<GuildProfile {...props} page="overall" />, getTheme(user)),
      },
      {
        label: "GEXP",
        generator: () => render(<GuildProfile {...props} page="gexp" />, getTheme(user)),
      },
      {
        label: "GEXP Per Game",
        generator: () =>
          render(<GuildProfile {...props} page="expPerGame" />, getTheme(user)),
      },
      {
        label: "Misc",
        generator: () => render(<GuildProfile {...props} page="misc" />, getTheme(user)),
      },
    ]);
  }

  @SubCommand({ description: (t) => t("commands.guild-list"), args: GuildArgument })
  public async list(context: CommandContext): Promise<IMessage> {
    const user = context.getUser();
    const t = context.t();

    const [guild, logo, background] = await Promise.all([
      this.getGuild(context),
      getLogo(user),
      getBackground("hypixel", "overall"),
    ]);

    const props: GuildListProfileProps = {
      guild,
      background,
      logo,
      user,
      t,
    };

    const canvas = render(<GuildListProfile {...props} />, getTheme(user));
    const buffer = await canvas.toBuffer("png");

    return {
      files: [{ name: "guild-list.png", data: buffer, type: "image/png" }],
    };
  }

  @SubCommand({ description: (t) => t("commands.guild-member"), args: [PlayerArgument] })
  public async member(context: CommandContext): Promise<IMessage> {
    const user = context.getUser();
    const t = context.t();

    const tag = context.option<string>("player");

    const { apiService } = this;
    const selfUuid = apiService.selfUuid(tag, user);

    const { player, guild, skin, badge, logo, background } = await all({
      player: () => apiService.getPlayer(tag, user),
      async guild() {
        const { guildId, uuid } = await this.$.player;
        return apiService.getGuild(guildId || uuid, guildId ? GuildQuery.ID : GuildQuery.PLAYER);
      },
      async skin() {
        return apiService.getPlayerSkin(selfUuid ?? (await this.$.player).uuid, user);
      },
      async badge() {
        return apiService.getUserBadge(selfUuid ?? (await this.$.player).uuid);
      },
      logo: () => getLogo(user),
      background: () => getBackground("hypixel", "overall"),
    });

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
      getTheme(user)
    );

    const buffer = await canvas.toBuffer("png");

    return {
      files: [{ name: "guild-member.png", data: buffer, type: "image/png" }],
    };
  }
}
