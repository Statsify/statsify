/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Container, Footer, Header, SidebarItem, Table } from "#components";
import { FormattedGame, GameMode, WarlordsMage, WarlordsModes, WarlordsPaladin, WarlordsShaman, WarlordsWarrior } from "@statsify/schemas";
import { WarlordsClassTable } from "./tables/index.js";
import { prettify } from "@statsify/util";
import type { BaseProfileProps } from "#commands/base.hypixel-command";

export interface WarlordsProfileProps extends BaseProfileProps {
  mode: GameMode<WarlordsModes>;
}

export const WarlordsProfile = ({
  player,
  background,
  logo,
  skin,
  t,
  badge,
  user,
  mode,
  time,
}: WarlordsProfileProps) => {
  const { warlords } = player.stats;

  const sidebar: SidebarItem[] = [
    [t("stats.coins"), t(warlords.coins), "§6"],
  ];

  if (mode.api !== "overall")
    sidebar.push(
      [t("stats.spec"), prettify(warlords[mode.api].specification), "§a"],
      [t("stats.level"), t(warlords[mode.api].level), "§a"]
    );

  let table: JSX.Element;

  switch (mode.api) {
    case "overall": {
      sidebar.push([t("stats.class"), prettify(warlords.class), "§e"]);
      const clazz = warlords.class as "mage" | "warrior" | "paladin" | "shaman";
      // Verify that the cast is correct and the class is a valid class
      if (clazz in warlords && typeof warlords[clazz] === "object") sidebar.push([t("stats.spec"), prettify(warlords[clazz].specification), "§a"]);

      table = (
        <Table.table>
          <Table.ts title="§6Overall">
            <Table.tr>
              <Table.td title={t("stats.wins")} value={t(warlords.wins)} color="§a" />
              <Table.td title={t("stats.losses")} value={t(warlords.losses)} color="§c" />
              <Table.td title={t("stats.wlr")} value={t(warlords.wlr)} color="§6" />
              <Table.td
                title={t("stats.gamesPlayed")}
                value={t(warlords.gamesPlayed)}
                color="§e"
              />
            </Table.tr>
            <Table.tr>
              <Table.td title={t("stats.kills")} value={t(warlords.kills)} color="§a" />
              <Table.td title={t("stats.deaths")} value={t(warlords.deaths)} color="§c" />
              <Table.td title={t("stats.kdr")} value={t(warlords.kdr)} color="§6" />
              <Table.td title={t("stats.assists")} value={t(warlords.assists)} color="§e" />
            </Table.tr>
          </Table.ts>
          <Table.tr>
            <Table.ts title="§6Capture the Flag">
              <Table.tr>
                <Table.td title={t("stats.wins")} value={t(warlords.captureTheFlag.wins)} color="§a" />
                <Table.td title={t("stats.kills")} value={t(warlords.captureTheFlag.kills)} color="§e" />
              </Table.tr>
            </Table.ts>
            <Table.ts title="§6Team Deathmatch">
              <Table.tr>
                <Table.td title={t("stats.wins")} value={t(warlords.teamDeathmatch.wins)} color="§a" />
                <Table.td title={t("stats.kills")} value={t(warlords.teamDeathmatch.kills)} color="§e" />
              </Table.tr>
            </Table.ts>
          </Table.tr>
          <Table.ts title="§6Domination">
            <Table.tr>
              <Table.td title={t("stats.wins")} value={t(warlords.domination.wins)} color="§a" />
              <Table.td title={t("stats.kills")} value={t(warlords.domination.kills)} color="§e" />
              <Table.td title={t("stats.score")} value={t(warlords.domination.score)} color="§6" />
              <Table.td title={t("stats.capturePoints")} value={t(warlords.domination.capturePoints)} color="§2" />
              <Table.td title={t("stats.defendPoints")} value={t(warlords.domination.defendPoints)} color="§b" />
            </Table.tr>
          </Table.ts>
        </Table.table>
      );
      break;
    }

    case "mage":
      table = <WarlordsClassTable stats={warlords.mage} constructor={WarlordsMage} color="§b" t={t} />;
      break;

    case "warrior":
      table = <WarlordsClassTable stats={warlords.warrior} constructor={WarlordsWarrior} color="§7" t={t} />;
      break;

    case "paladin":
      table = <WarlordsClassTable stats={warlords.paladin} constructor={WarlordsPaladin} color="§e" t={t} />;
      break;

    case "shaman":
      table = <WarlordsClassTable stats={warlords.shaman} constructor={WarlordsShaman} color="§2" t={t} />;
      break;
  }

  return (
    <Container background={background}>
      <Header
        skin={skin}
        name={player.prefixName}
        badge={badge}
        sidebar={sidebar}
        title={`§l${FormattedGame.WARLORDS} §fStats §r(${mode.formatted})`}
        time={time}
      />
      {table}
      <Footer logo={logo} user={user} />
    </Container>
  );
};
