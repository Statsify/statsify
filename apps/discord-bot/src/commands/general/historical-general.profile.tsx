/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Container, Footer, Header, Table } from "#components";
import { EVENT_COLORS } from "#commands/events/event-colors";
import { EVENT_TYPES, FormattedGame } from "@statsify/schemas";
import type { BaseProfileProps } from "#commands/base.hypixel-command";

const latestEvent = EVENT_TYPES[0];
const latestEventColor = EVENT_COLORS[latestEvent.period];

export const HistoricalGeneralProfile = ({
  background,
  logo,
  player,
  skin,
  t,
  time,
  badge,
  user,
}: BaseProfileProps) => {
  const { general, quests, challenges } = player.stats;

  return (
    <Container background={background}>
      <Header
        name={player.prefixName}
        skin={skin}
        title={`§l${FormattedGame.GENERAL} Stats`}
        time={time}
        badge={badge}
      />
      <Table.table>
        <Table.tr>
          <Table.td
            title={t("stats.levelsGained")}
            value={t(general.networkLevel)}
            color="§b"
          />
          <Table.td
            title={t("stats.achievementPoints")}
            value={t(general.achievementPoints)}
            color="§6"
          />
          <Table.td
            title={t("stats.event-exp")}
            value={t(general.events[latestEvent.key].exp)}
            color={latestEventColor}
          />
        </Table.tr>
        <Table.tr>
          <Table.td title={t("stats.quests")} value={t(quests.total)} color="§e" />
          <Table.td
            title={t("stats.challenges")}
            value={t(challenges.total)}
            color="§a"
          />
          <Table.td title={t("stats.karma")} value={t(general.karma)} color="§d" />
        </Table.tr>
      </Table.table>
      <Footer logo={logo} user={user} />
    </Container>
  );
};
