/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ApiService } from "#services";
import { Command, CommandContext, PlayerArgument } from "@statsify/discord";
import { Container, Footer, Header, Table } from "#components";
import { LeaderboardScanner, Parkour } from "@statsify/schemas";
import { formatTime, removeFormatting } from "@statsify/util";
import { getBackground, getLogo } from "@statsify/assets";
import { getTheme } from "../themes";
import { render } from "@statsify/rendering";

@Command({
  description: (t) => t("commands.parkour"),
  args: [PlayerArgument],
  cooldown: 5,
})
export class ParkourCommand {
  public constructor(private readonly apiService: ApiService) {}
  public async run(context: CommandContext) {
    const user = context.getUser();

    const player = await this.apiService.getPlayer(context.option("player"), user);

    const { parkour } = player.stats;

    const [logo, skin, badge] = await Promise.all([
      getLogo(user?.tier),
      this.apiService.getPlayerSkin(player.uuid),
      this.apiService.getUserBadge(player.uuid),
    ]);

    const background = await getBackground("hypixel", "overall");

    const times = Object.entries(parkour).map(([field, time]) => [
      removeFormatting(
        LeaderboardScanner.getLeaderboardField(Parkour, field)
          .name.replaceAll("Lobby", "")
          .trim()
      ),
      time == 0 ? null : time,
    ]);

    times.sort((a, b) => (a[1] ?? Number.MAX_VALUE) - (b[1] ?? Number.MAX_VALUE));

    const rowSize = 4;
    const rows = Array.from({ length: Math.ceil(times.length / rowSize) }, (_, i) =>
      times.slice(i * rowSize, (i + 1) * rowSize)
    );

    const container = (
      <Container background={background}>
        <Header
          name={player.prefixName}
          skin={skin}
          badge={badge}
          title="Parkour Times"
          time={"LIVE"}
        />
        <Table.table>
          {rows.map((row) => (
            <Table.tr>
              {row.map((game) => (
                <Table.td
                  title={`§a§l${game[0]}`}
                  value={
                    game[1]
                      ? formatTime(game[1], { short: true, accuracy: "second" })
                      : "N/A"
                  }
                  color="§e"
                />
              ))}
            </Table.tr>
          ))}
        </Table.table>
        <Footer logo={logo} tier={user?.tier} />
      </Container>
    );

    const canvas = render(container, getTheme(user?.theme));
    const img = await canvas.toBuffer("png");

    return {
      files: [{ name: "parkour.png", data: img, type: "image/png" }],
    };
  }
}
