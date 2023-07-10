/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Container, Footer, Header, Table } from "#components";
import { DateTime } from "luxon";
import { GexpTable } from "./gexp.table.js";
import { Guild } from "@statsify/schemas";
import type { BaseProfileProps } from "#commands/base.hypixel-command";

export interface GuildMemberProfileProps extends Omit<BaseProfileProps, "time"> {
  guild: Guild;
}

export const GuildMemberProfile = ({
  player,
  guild,
  skin,
  badge,
  logo,
  background,
  user,
  t,
}: GuildMemberProfileProps) => {
  const member = guild.members.find((m) => m.uuid === player.uuid)!;

  const format = "LL/dd/yy',' hh:mm a";
  const createdAt = DateTime.fromMillis(member.joinTime).toFormat(format, {
    locale: t.locale,
  });

  const description = [
    `§7Guild: ${guild.tagColor.code}${guild.name}`,
    `§7${t("stats.guild.rank")}: ${guild.tagColor.code}${member.rank}`,
    `§7${t("stats.guild.joinedAt")}: §3${createdAt}`,
    `§7${t("stats.guild.quests")}: §b${t(member.questParticipation)}`,
  ].join("\n");

  const positions = guild.expHistory.slice(0, 7).map((_, i) => {
    const position = guild.members
      .sort((a, b) => Number(b.expHistory[i]) - Number(a.expHistory[i]))
      .findIndex((m) => m.uuid === member.uuid);

    return `§7#§f${t(position + 1)}§8/§7${guild.members.length}`;
  });

  return (
    <Container background={background}>
      <Header
        name={`${player.displayName}${
          guild.tagFormatted ? ` §^2^${guild.tagFormatted}` : ""
        }`}
        skin={skin}
        time="LIVE"
        title="§l§2Guild Member §fStats"
        description={description}
        badge={badge}
        size={3}
      />
      <Table.table>
        <Table.tr>
          <Table.td title={t("stats.guild.daily")} value={t(member.daily)} color="§2" />
          <Table.td title={t("stats.guild.weekly")} value={t(member.weekly)} color="§2" />
          <Table.td
            title={t("stats.guild.monthly")}
            value={t(member.monthly)}
            color="§2"
          />
        </Table.tr>
      </Table.table>
      <GexpTable
        dates={guild.expHistoryDays}
        expHistory={member.expHistory}
        positions={positions}
        t={t}
      />
      <Footer logo={logo} user={user} />
    </Container>
  );
};
