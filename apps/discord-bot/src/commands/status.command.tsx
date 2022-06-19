/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ApiService } from "#services";
import {
  Command,
  CommandContext,
  LocalizeFunction,
  PlayerArgument,
} from "@statsify/discord";
import { Container, Footer, Header, If, Table } from "#components";
import { Status, games, modes } from "@statsify/schemas";
import { formatTime, prettify } from "@statsify/util";
import { getBackground, getLogo } from "@statsify/assets";
import { getTheme } from "../themes";
import { render } from "@statsify/rendering";

@Command({
  description: (t) => t("commands.status"),
  args: [PlayerArgument],
  cooldown: 5,
})
export class StatusCommand {
  public constructor(private readonly apiService: ApiService) {}
  public async run(context: CommandContext) {
    const t = context.t();

    const user = context.getUser();

    const status = await this.apiService.getStatus(context.option("player"), user);

    const [logo, skin, badge] = await Promise.all([
      getLogo(user?.tier),
      this.apiService.getPlayerSkin(status.uuid),
      this.apiService.getUserBadge(status.uuid),
    ]);

    const background =
      status.online && status.game.name != "Limbo"
        ? await getBackground(status.game.name.toLowerCase(), "overall")
        : await getBackground("hypixel", "overall");

    const container = (
      <Container background={background}>
        <Header
          name={status.prefixName}
          skin={skin}
          badge={badge}
          title="Player Status"
          time={"LIVE"}
        />
        <If condition={status.actions.statusHidden}>{this.hiddenTable(status, t)}</If>
        <If condition={status.online}>{await this.onlineTable(status, t)}</If>
        <If condition={!status.actions.statusHidden && !status.online}>
          {this.offlineTable(status, t)}
        </If>
        <Footer logo={logo} tier={user?.tier} />
      </Container>
    );

    const canvas = render(container, getTheme(user?.theme));
    const img = await canvas.toBuffer("png");

    return {
      files: [{ name: "status.png", data: img, type: "image/png" }],
    };
  }

  private hiddenTable(status: Status, t: LocalizeFunction) {
    return (
      <Table.table>
        <Table.tr>
          <Table.td title="Status" value={t("stats.hidden")} color="§4" />
        </Table.tr>
        <Table.tr>
          <Table.td
            title={t("stats.lastActionTime")}
            value={this.timeAgo(status.actions.lastActionTime, t)}
            color="§a"
          />
          <Table.td
            title={t("stats.lastAction")}
            value={prettify(status.actions.lastAction)}
            color="§a"
          />
        </Table.tr>
      </Table.table>
    );
  }

  private async onlineTable(status: Status, t: LocalizeFunction) {
    const resource = await this.apiService.getResource("games");
    const gameInfo = resource?.games;

    const gameName = this.getGameName(status.game.code);

    const game = <Table.td title={t("stats.game")} value={gameName} color="§e" />;

    let gameRow;
    if (status.mode) {
      const modeName = this.getModeName(gameInfo, status.game.code, status.mode);

      gameRow = (
        <Table.tr>
          {game}
          <Table.td title={t("stats.mode")} value={modeName} color="§e" />
          <If condition={status.map}>
            <Table.td
              title={t("stats.map")}
              value={status.map ?? t("unknown")}
              color="§e"
            />
          </If>
        </Table.tr>
      );
    } else {
      gameRow = <Table.tr>{game}</Table.tr>;
    }

    return (
      <Table.table>
        <Table.tr>
          <Table.td title={t("stats.status")} value={t("stats.online")} color="§a" />
          <Table.td
            title={t("stats.version")}
            value={status.actions.version}
            color="§b"
          />
          <Table.td
            title={t("stats.loginTime")}
            value={this.timeAgo(status.actions.lastLogin, t)}
            color="§b"
          />
        </Table.tr>
        {gameRow}
      </Table.table>
    );
  }

  private offlineTable(status: Status, t: LocalizeFunction) {
    return (
      <Table.table>
        <Table.tr>
          <Table.td title="Status" value={t("stats.offline")} color="§c" />
        </Table.tr>
        <Table.tr>
          <Table.td
            title={t("stats.logoutTime")}
            value={this.timeAgo(status.actions.lastLogout, t)}
            color="§a"
          />
          <Table.td
            title={t("stats.lastGame")}
            value={status.actions.lastGame.name}
            color="§a"
          />
        </Table.tr>
      </Table.table>
    );
  }

  private timeAgo(timestamp: number, t: LocalizeFunction) {
    const difference = Date.now() - timestamp;
    if (difference < 60_000) {
      return t("now");
    }

    return `${formatTime(Date.now() - timestamp, { short: true })} ${t("ago")}`;
  }

  private getGameName(game: string) {
    return games.find(({ code }) => code == game)?.name ?? prettify(game);
  }

  private getModeName(
    gameInfo: Record<string, { modeNames?: Record<string, string> }>,
    game: string,
    mode: string
  ) {
    return (
      gameInfo[game]?.modeNames?.[mode] ??
      modes[game]?.[mode] ??
      prettify(mode.toLowerCase())
    );
  }
}
