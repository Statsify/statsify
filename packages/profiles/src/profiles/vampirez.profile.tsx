/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  Container,
  Footer,
  Header,
  SidebarItem,
  Table,
  formatProgression,
} from "../components/index.js";
import { FormattedGame, type GameMode, VampireZModes } from "@statsify/schemas";
import { VAMPIREZ, cardColours } from "@statsify/catalog";
import type { BaseProfileProps } from "../types.js";

export interface VampireZProfileProps extends BaseProfileProps {
  mode: GameMode<VampireZModes>;
}

export const VampireZProfile = ({
  skin,
  player,
  background,
  logo,
  user,
  badge,
  t,
  time,
  mode,
}: VampireZProfileProps) => {
  const { vampirez } = player.stats;
  const { api } = mode;
  const colour = cardColours(VAMPIREZ, mode.api);

  const sidebar: SidebarItem[] = [
    [t("stats.coins"), t(vampirez.coins), colour("coins")],
    [t("stats.tokens"), t(vampirez.tokens), colour("tokens")],
    [t("stats.overallWins"), t(vampirez.overallWins), colour("overallWins")],
    [t("stats.zombieKills"), t(vampirez.zombieKills), colour("zombieKills")],
  ];

  if (time === "LIVE")
    sidebar.push([t("stats.mostVampireKills"), t(vampirez.mostVampireKills), colour("mostVampireKills")]);

  return (
    <Container background={background}>
      <Header
        skin={skin}
        name={player.prefixName}
        badge={badge}
        sidebar={sidebar}
        title={`§l${FormattedGame.VAMPIREZ} §fStats §r(${mode.formatted})`}
        description={`§7${t("stats.prefix")}: ${
          vampirez[api].naturalPrefix
        }\n${formatProgression({
          t,
          label:
            api === "human" ? t("stats.progression.win") : t("stats.progression.kill"),
          progression: vampirez[api].progression,
          currentLevel: vampirez[api].currentPrefix,
          nextLevel: vampirez[api].nextPrefix,
        })}`}
        time={time}
        historicalSidebar
      />
      <Table.table>
        <Table.tr>
          <Table.td title={t("stats.wins")} value={t(vampirez[api].wins)} color={colour("wins")} />
          <Table.td
            title={
              api === "human" ? t("stats.vampires-killed") : t("stats.humans-killed")
            }
            value={t(vampirez[api].kills)}
            color={colour("kills")}
          />
          <Table.td
            title={t("stats.deaths")}
            value={t(vampirez[api].deaths)}
            color={colour("deaths")}
          />
          <Table.td title={t("stats.kdr")} value={t(vampirez[api].kdr)} color={colour("kdr")} />
        </Table.tr>
      </Table.table>
      <Footer logo={logo} user={user} />
    </Container>
  );
};
