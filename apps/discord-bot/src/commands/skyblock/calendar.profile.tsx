/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Container, Footer, Table } from "#components";
import { SKYBLOCK_MONTHS, nextEvents, skyblockDate } from "@statsify/skyblock/display";
import { formatTime } from "@statsify/util";
import { gridRows } from "./components/ItemGrid.js";
import type { Image } from "skia-canvas";
import type { LocalizeFunction } from "@statsify/discord";
import type { MayorView } from "@statsify/skyblock";
import type { User } from "@statsify/schemas";

export interface SkyBlockCalendarProfileProps {
  now: number;
  mayor: MayorView;
  background: Image;
  logo: Image;
  user: User | null;
  t: LocalizeFunction;
  title: string;
}

export const SkyBlockCalendarProfile = ({ now, mayor, background, logo, user, t, title }: SkyBlockCalendarProfileProps) => {
  const { year, month, day } = skyblockDate(now);

  const perks = [
    ...mayor.mayor.perks.map((perk) => ({ ...perk, holder: mayor.mayor.name })),
    ...(mayor.minister ? [{ ...mayor.minister.perk, holder: mayor.minister.name }] : []),
  ];

  const events = nextEvents(now, perks.map(({ name }) => name)).map(({ key, start, end }) => {
    const on = start <= now;
    const time = formatTime((on ? end : start) - now, { entries: 2 });
    return (
      <Table.td
        title={t(`skyblock.events.${key}`)}
        value={t(on ? "skyblock.endsIn" : "skyblock.startsIn", { time })}
        color={on ? "§a" : "§e"}
        size="small"
      />
    );
  });

  return (
    <Container background={background}>
      <box width="100%" direction="column">
        <text>{`§^3^${title}`}</text>
        <text>{`§e${t(`skyblock.months.${SKYBLOCK_MONTHS[month]}`)} ${t(day)}§7, ${t("skyblock.year", { year })}`}</text>
      </box>
      <Table.table>
        <Table.ts title={`§b${t("skyblock.upcomingEvents")}`}>{gridRows(events, 3)}</Table.ts>
        <Table.ts title={`§6${t("skyblock.mayorPerks")}`}>
          {perks.map(({ name, holder }) => (
            <Table.tr>
              <Table.td title={`§e${name}`} value={`§7${holder}`} color="§7" size="small" />
            </Table.tr>
          ))}
        </Table.ts>
      </Table.table>
      <Footer logo={logo} user={user} />
    </Container>
  );
};
