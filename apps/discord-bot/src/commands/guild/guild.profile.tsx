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
  GameList,
  If,
  Multiline,
  Table,
  formatProgression,
  lineXpBar,
} from "#components";
import { DateTime } from "luxon";
import { GameId, Guild, GuildMember, Progression, User } from "@statsify/schemas";
import { GexpTable } from "./gexp.table.js";
import { LocalizeFunction } from "@statsify/discord";
import { StyleLocation } from "@statsify/rendering";
import { arrayGroup, wordGroup } from "@statsify/util";
import { ratio } from "@statsify/math";
import type { Image } from "skia-canvas";

const LINK_REGEX =
  /https?:\/\/(www\.)?[\w#%+.:=@~-]{1,256}\.[\d()A-Za-z]{1,6}\b([\w#%&()+./:=?@~-]*)|[\w#%+.:=@~-]{1,256}\.[\d()A-Za-z]{1,6}\b([\w#%&()+./:=?@~-]*)/g;

interface GuildBlockProps {
  width?: JSX.Measurement;
  height?: JSX.Measurement;
  title?: string;
  children: JSX.Children;
}

const GuildBlock = ({ title, width, height, children }: GuildBlockProps) => (
  <div width={width} height={height} direction="column">
    <If condition={title}>
      {(title) => (
        <box width="100%" direction="column">
          <text>§7{title}</text>
        </box>
      )}
    </If>
    <>{children}</>
  </div>
);

const text: JSX.IntrinsicElements["text"] = {
  align: "left" as StyleLocation,
  margin: { top: 1, bottom: 1 },
};

const box: JSX.IntrinsicElements["box"] = {
  padding: { left: 8, right: 8, top: 4, bottom: 4 },
  width: "100%",
  height: "remaining",
  direction: "column",
};

export interface GuildProfileProps {
  guild: Guild;
  guildMaster: GuildMember;
  skin: Image;
  gameIcons: Record<string, Image>;
  background: Image;
  logo: Image;
  user: User | null;
  t: LocalizeFunction;
  ranking: number;
  page: "overall" | "gexp" | "expPerGame" | "misc";
}

export const GuildProfile = ({
  guild,
  background,
  logo,
  user,
  t,
  guildMaster,
  skin,
  ranking,
  gameIcons,
  page,
}: GuildProfileProps) => {
  let pageEl: JSX.Element;

  switch (page) {
    case "gexp":
      pageEl = <GuildGexpPage guild={guild} t={t} />;
      break;
    case "expPerGame":
      pageEl = <GuildGexpPerGamePage guild={guild} t={t} gameIcons={gameIcons} />;
      break;
    case "misc":
      pageEl = <GuildMiscPage guild={guild} t={t} />;
      break;
    default:
    case "overall":
      pageEl = (
        <GuildOverallPage
          guild={guild}
          t={t}
          guildMaster={guildMaster}
          skin={skin}
          ranking={ranking}
          gameIcons={gameIcons}
        />
      );
      break;
  }

  return (
    <Container background={background}>
      <box width="100%">
        <text t:ignore>§^4^{guild.nameFormatted}</text>
      </box>
      {pageEl}
      <Footer logo={logo} user={user} />
    </Container>
  );
};

interface GuildOverallPageProps {
  guild: Guild;
  guildMaster: GuildMember;
  skin: Image;
  gameIcons: Record<string, Image>;
  t: LocalizeFunction;
  ranking: number;
}

const GuildOverallPage = ({
  guild,
  gameIcons,
  guildMaster,
  ranking,
  skin,
  t,
}: GuildOverallPageProps) => {
  const format = "LL/dd/yy',' hh:mm a";
  const createdAt = DateTime.fromMillis(guild.createdAt).toFormat(format, {
    locale: t.locale,
  });
  const preferredGames = guild.preferredGames.map((g) => gameIcons[g]);

  return (
    <>
      <div width="100%">
        <GuildBlock title="Guild Info" width="remaining" height="100%">
          <box {...box}>
            <div location="center">
              <text {...text}>{`§b${t("stats.guild.guildMaster")}:`}</text>
              <img image={skin} margin={{ left: 8, right: 8 }} />
              <text {...text} t:ignore>
                {guildMaster.displayName}
              </text>
            </div>
            <text {...text}>{`§3${t("stats.guild.createdOn")}: §7${createdAt}`}</text>
            <text {...text}>{`§9${t("stats.guild.members")}: §f${t(
              guild.members.length
            )}§8/§f125`}</text>
            <text {...text}>{`§2${t("stats.guild.gexp")}:§f ${t(guild.exp)} §8[§7#§f${t(
              ranking
            )}§8]`}</text>
            <text {...text}>{`§e${t("stats.guild.level")}:§f ${t(guild.level)}`}</text>
          </box>
        </GuildBlock>
        <If condition={guild.description}>
          {(description) => (
            <GuildBlock title="Guild Description" height="100%">
              <box {...box}>
                {wordGroup(description, 10).map((m) => (
                  <text {...text}>
                    {m.replace(LINK_REGEX, (match) => `§b§u${match}§r`)}
                  </text>
                ))}
              </box>
            </GuildBlock>
          )}
        </If>
      </div>
      <GuildBlock title="Guild Experience" width="100%">
        <Table.table>
          <Table.tr>
            <Table.td title={t("stats.guild.daily")} value={t(guild.daily)} color="§2" />
            <Table.td
              title={t("stats.guild.weekly")}
              value={t(guild.weekly)}
              color="§2"
            />
            <Table.td
              title={t("stats.guild.monthly")}
              value={t(guild.monthly)}
              color="§2"
            />
          </Table.tr>
        </Table.table>
      </GuildBlock>
      <If condition={preferredGames.length > 0}>
        <GuildBlock title="Preferred Games" width="100%">
          <box {...box} direction="row">
            {preferredGames.map((g, i) => (
              <img
                image={g}
                width={32}
                height={32}
                margin={{
                  top: 4,
                  bottom: 4,
                  left: i === 0 ? 0 : 4,
                  right: i === preferredGames.length - 1 ? 0 : 4,
                }}
              />
            ))}
          </box>
        </GuildBlock>
      </If>
    </>
  );
};

interface GuildGexpPageProps {
  guild: Guild;
  t: LocalizeFunction;
}

const GuildGexpPage = ({ guild, t }: GuildGexpPageProps) => {
  const guildColor = guild.tagColor.code;

  const leveling = `§7${t("stats.guild.level")}: ${guildColor}${t(
    guild.level
  )}\n${formatProgression({
    t,
    label: t("stats.progression.gexp"),
    progression: guild.progression,
    currentLevel: `${guildColor}${t(Math.floor(guild.level))}`,
    nextLevel: `${guildColor}${t(Math.floor(guild.level) + 1)}`,
    renderXp: lineXpBar(guildColor),
  })}`;

  return (
    <>
      <GuildBlock title="Guild Leveling" width="100%">
        <box {...box}>
          <Multiline>{leveling}</Multiline>
        </box>
      </GuildBlock>
      <GuildBlock title="Guild Experience" width="100%">
        <Table.table>
          <Table.tr>
            <Table.td
              title={t("stats.guild.daily")}
              value={t(guild.daily)}
              color="§2"
              size="small"
            />
            <Table.td
              title={t("stats.guild.weekly")}
              value={t(guild.weekly)}
              color="§2"
              size="small"
            />
            <Table.td
              title={t("stats.guild.monthly")}
              value={t(guild.monthly)}
              color="§2"
              size="small"
            />
          </Table.tr>
        </Table.table>
      </GuildBlock>
      <GuildBlock title="Scaled Guild Experience" width="100%">
        <Table.table>
          <Table.tr>
            <Table.td
              title={t("stats.guild.daily")}
              value={t(guild.scaledDaily)}
              color="§2"
              size="small"
            />
            <Table.td
              title={t("stats.guild.weekly")}
              value={t(guild.scaledWeekly)}
              color="§2"
              size="small"
            />
            <Table.td
              title={t("stats.guild.monthly")}
              value={t(guild.scaledMonthly)}
              color="§2"
              size="small"
            />
          </Table.tr>
        </Table.table>
      </GuildBlock>
      <GuildBlock title={t("stats.guild.averageMemberGexp")} width="100%">
        <Table.table>
          <Table.tr>
            <Table.td
              title={t("stats.guild.daily")}
              value={t(ratio(guild.daily, guild.members.length))}
              color="§2"
              size="small"
            />
            <Table.td
              title={t("stats.guild.weekly")}
              value={t(ratio(guild.weekly, guild.members.length))}
              color="§2"
              size="small"
            />
            <Table.td
              title={t("stats.guild.monthly")}
              value={t(ratio(guild.monthly, guild.members.length))}
              color="§2"
              size="small"
            />
          </Table.tr>
        </Table.table>
      </GuildBlock>
      <GuildBlock title="GEXP History" width="100%">
        <GexpTable
          dates={guild.expHistoryDays}
          expHistory={guild.expHistory}
          scaledExpHistory={guild.scaledExpHistory}
          t={t}
        />
      </GuildBlock>
    </>
  );
};

interface GuildGexpPerGamePageProps {
  guild: Guild;
  t: LocalizeFunction;
  gameIcons: Record<string, Image>;
}

const GuildGexpPerGamePage = ({ guild, t, gameIcons }: GuildGexpPerGamePageProps) => {
  const expPerGame = Object.entries(guild.expByGame);
  const games: [GameId, any][] = expPerGame
    .filter(([, exp]) => exp > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([field, exp]) => [field as GameId, t(exp)]);

  return <GameList entries={games} gameIcons={gameIcons} />;
};

interface GuildMiscPageProps {
  guild: Guild;
  t: LocalizeFunction;
}

const formatGuildAchievement = (achievement: Progression, t: LocalizeFunction) =>
  `${t(achievement.current)}§7/${t(achievement.max!)}`;

const GuildMiscPage = ({ guild, t }: GuildMiscPageProps) => {
  const { achievements } = guild;
  const ranksGroups = arrayGroup(guild.ranks, 3);

  return (
    <>
      <GuildBlock width="100%" title="Guild Achievements">
        <Table.table>
          <Table.tr>
            <Table.td
              title={`Prestige ${achievements.prestigeTier}`}
              value={formatGuildAchievement(achievements.prestigeProgression, t)}
              color="§e"
            />
            <Table.td
              title={`Experience Kings ${achievements.experienceKingsTier}`}
              value={formatGuildAchievement(achievements.experienceKingsProgression, t)}
              color="§e"
            />
          </Table.tr>
          <Table.tr>
            <Table.td
              title={`Winners ${achievements.winnersTier}`}
              value={formatGuildAchievement(achievements.winnersProgression, t)}
              color="§e"
            />
            <Table.td
              title={`Family ${achievements.familyTier}`}
              value={formatGuildAchievement(achievements.familyProgression, t)}
              color="§e"
            />
          </Table.tr>
        </Table.table>
      </GuildBlock>
      <GuildBlock width="100%" title="Guild Quests">
        <Table.table>
          <Table.tr>
            <Table.td
              title="Quests Completed"
              value={t(guild.questParticipation)}
              color="§b"
            />
          </Table.tr>
        </Table.table>
      </GuildBlock>
      <GuildBlock width="100%" title="Guild Ranks">
        {ranksGroups.map((ranks) => (
          <div width="100%">
            {ranks.map((rank) => (
              <box width={`1/${ranks.length}`}>
                <text>
                  {`${guild.tagColor.code}${rank.name}${
                    rank.tag ? ` [${rank.tag}]` : ""
                  }`}
                </text>
              </box>
            ))}
          </div>
        ))}
      </GuildBlock>
    </>
  );
};
