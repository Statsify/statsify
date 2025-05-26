/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  Container,
  Footer,
  Header,
  Multiline,
  SidebarItem,
  Table,
  formatProgression,
  lineXpBar,
} from "#components";
import { EVENT_COLORS } from "./event-colors.js";
import { arrayGroup, prettify } from "@statsify/util";
import type { BaseProfileProps } from "#commands/base.hypixel-command";
import type { Event, EventPeriod, EventType } from "@statsify/schemas";
import type { LocalizeFunction } from "@statsify/discord";

interface EventTableProps {
  type: EventType;
  event: Event;
  t: LocalizeFunction;
}

const EventTable = ({ type, event, t }: EventTableProps) => {
  const { period, year } = type;
  const title = `${prettify(period)} ${year}`;
  const color = EVENT_COLORS[period as EventPeriod];

  const levelling = [
    `§7${t("stats.event-level")}: ${color}${t(Math.floor(event.level))}`,
    formatProgression({
      t,
      label: t("stats.progression.exp"),
      progression: event.progression,
      currentLevel: `${color}${t(Math.floor(event.level))}`,
      nextLevel: `${color}${t(Math.floor(event.level) + 1)}`,
      renderXp: lineXpBar(color),
    }),
  ].join("\n");

  return (
    <Table.ts title={`${color}${title}`}>
      <box width="remaining" align="center" direction="column" height="50%">
        <Multiline margin={2}>{levelling}</Multiline>
      </box>
      <Table.td title={t("stats.exp")} value={t(event.exp)} color={color} />
    </Table.ts>
  );
};

interface EventsProfileProps extends Omit<BaseProfileProps, "time"> {
  eventNames: EventType[];
}

export const EventsProfile = ({
  player,
  skin,
  background,
  logo,
  user,
  badge,
  t,
  eventNames,
}: EventsProfileProps) => {
  const { events } = player.stats.general;

  const sidebar: SidebarItem[] = [[t("stats.silver"), t(events.silver), "§7"]];

  return (
    <Container background={background}>
      <Header
        name={player.prefixName}
        skin={skin}
        badge={badge}
        sidebar={sidebar}
        time="LIVE"
        title="§l§bEvent §fStats"
      />
      <Table.table>
        {arrayGroup(eventNames, 2).map((eventTypes) => (
          <Table.tr>
            {eventTypes.map((type) => (
              <EventTable type={type} event={events[type.key]} t={t} />
            ))}
          </Table.tr>
        ))}
      </Table.table>
      <Footer logo={logo} user={user} />
    </Container>
  );
};
