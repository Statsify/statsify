/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Container, Footer, Header, If, Table } from "#components";
import { DateTime } from "luxon";
import { FormattedGame, Guild, PlayerStatus } from "@statsify/schemas";
import { LocalizeFunction } from "@statsify/discord";
import type { BaseProfileProps } from "#commands/base.hypixel-command";

interface GeneralProfileHeaderBodyProps {
  guild?: Guild;
  status: PlayerStatus;
  t: LocalizeFunction;
}

const GeneralProfileHeaderBody = ({
  guild,
  status,
  t,
}: GeneralProfileHeaderBodyProps) => {
  const online = status.online ? `§a${t("stats.online")}` : `§c${t("stats.offline")}`;

  const format = "LL/dd/yy',' hh:mm a";
  const firstLogin = DateTime.fromMillis(status.firstLogin).toFormat(format, {
    locale: t.locale,
  });

  const lastLogin = status.lastLogin
    ? DateTime.fromMillis(status.lastLogin).toFormat(format, { locale: t.locale })
    : "N/A";

  return (
    <div height="remaining" width="remaining" direction="row">
      <div width="remaining" height="100%" direction="column">
        <box width="100%" height="50%">
          <text>
            §7{t("stats.guild.guild")}: §2{guild?.name ?? "N/A"}
          </text>
        </box>
        <box width="100%" height="50%">
          <text>
            §7{t("stats.status")}: {online}
          </text>
        </box>
      </div>
      <box height="100%" direction="column">
        <text align="left">
          §7{t("stats.firstLogin")}: §3{firstLogin}
        </text>
        <text align="left">
          §7{t("stats.lastLogin")}: §3{lastLogin}
        </text>
      </box>
    </div>
  );
};

export interface GeneralProfileProps extends BaseProfileProps {
  guild?: Guild;
}

export const GeneralProfile = ({
  background,
  logo,
  player,
  skin,
  t,
  badge,
  user,
  guild,
  time,
}: GeneralProfileProps) => {
  const { general, challenges, quests } = player.stats;
  const { status } = player;
  const member = guild?.members.find((m) => m.uuid === player.uuid);

  return (
    <Container background={background}>
      <Header
        name={`${player.displayName}§^2^${guild?.tag ? ` ${guild.tagFormatted}` : ""}`}
        skin={skin}
        badge={badge}
        size={3}
        title={`§l${FormattedGame.GENERAL} Stats`}
        time={time}
      >
        <GeneralProfileHeaderBody guild={guild} status={status} t={t} />
      </Header>
      <Table.table>
        <Table.tr>
          <Table.td
            title={t("stats.networkLevel")}
            value={t(general.networkLevel)}
            color="§6"
          />
          <Table.td
            title={t("stats.achievementPoints")}
            value={t(general.achievementPoints)}
            color="§6"
          />
        </Table.tr>
        <Table.tr>
          <Table.td title={t("stats.quests")} value={t(quests.total)} color="§a" />
          <Table.td
            title={t("stats.challenges")}
            value={t(challenges.total)}
            color="§a"
          />
        </Table.tr>
        <Table.tr>
          <Table.td title={t("stats.karma")} value={t(general.karma)} color="§d" />
          <Table.td
            title={t("stats.rewardStreak")}
            value={t(general.currentRewardStreak)}
            color="§d"
          />
          <Table.td
            title={t("stats.giftsSent")}
            value={t(general.giftsSent)}
            color="§5"
          />
          <Table.td
            title={t("stats.ranksGifted")}
            value={t(general.ranksGifted)}
            color="§5"
          />
        </Table.tr>
        <If condition={member}>
          {(member) => (
            <Table.tr>
              <Table.td
                title={t("stats.guild.quests")}
                value={t(member.questParticipation)}
                color="§2"
              />
              <Table.td
                title={t("stats.guild.daily-gexp")}
                value={t(member.daily)}
                color="§2"
              />
              <Table.td
                title={t("stats.guild.weekly-gexp")}
                value={t(member.weekly)}
                color="§2"
              />
            </Table.tr>
          )}
        </If>
      </Table.table>
      <Footer logo={logo} user={user} />
    </Container>
  );
};
