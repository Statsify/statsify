import { Container, Footer, If } from '#components';
import { LocalizeFunction } from '@statsify/discord';
import { ratio } from '@statsify/math';
import { Spacing, StyleLocation } from '@statsify/rendering';
import { Guild, GuildMember, UserTier } from '@statsify/schemas';
import { arrayGroup, wordGroup } from '@statsify/util';
import { DateTime } from 'luxon';
import type { Image } from 'skia-canvas';

interface GuildBlockProps {
  width?: JSX.Measurement;
  height?: JSX.Measurement;
  title?: string;
  children: JSX.Children;
}

const GuildBlock = ({ title, width, height, children }: GuildBlockProps) => (
  <box width={width} height={height} direction="column" align="left" location="left" padding={0}>
    <div width="100%" direction="column" margin={{ top: 6, bottom: 6, left: 14, right: 14 }}>
      <If condition={title}>
        {(title) => (
          <text align="left" margin={{ left: 0, right: 0, top: 0, bottom: 2 }}>
            §7{title}
          </text>
        )}
      </If>
      <>{children}</>
    </div>
  </box>
);

export interface GuildProfileProps {
  guild: Guild;
  guildMaster: GuildMember;
  skin: Image;
  games: Image[];
  background: Image;
  logo: Image;
  tier?: UserTier;
  t: LocalizeFunction;
  ranking: number;
}

export const GuildProfile = ({
  guild,
  background,
  logo,
  tier,
  t,
  guildMaster,
  skin,
  ranking,
  games,
}: GuildProfileProps) => {
  const margin: Spacing = { top: 1, bottom: 1 };
  const text = { align: 'left' as StyleLocation, margin };

  const format = "LL/dd/yy',' hh:mm a";
  const createdAt = DateTime.fromMillis(guild.createdAt).toFormat(format, { locale: t.locale });

  const gameGroups = arrayGroup(games, 8);
  const rankGroups = arrayGroup(guild.ranks, 6);

  return (
    <Container background={background}>
      <box width="100%">
        <text>§^4^{guild.nameFormatted}</text>
      </box>
      <div width="100%">
        <GuildBlock width="remaining" height="100%">
          <div location="center">
            <text {...text}>{`§2${t('stats.guild.guildMaster')}:`}</text>
            <img image={skin} margin={{ left: 8, right: 8 }} />
            <text {...text}>{guildMaster.displayName}</text>
          </div>
          <text {...text}>{`§3${t('stats.guild.createdOn')}: §7${createdAt}`}</text>
          <text {...text}>{`§7${t('stats.guild.members')}: §f${t(
            guild.members.length
          )}§8/§f125`}</text>
          <text {...text}>{`§e${t('stats.guild.rank')}: §7#§f${t(ranking)}`}</text>
        </GuildBlock>
        <If condition={guild.description}>
          {(description) => (
            <GuildBlock title="Guild Description" height="100%">
              {wordGroup(description, 10).map((m) => (
                <text {...text}>{m}</text>
              ))}
            </GuildBlock>
          )}
        </If>
      </div>

      <div width="100%">
        <GuildBlock title="Guild Experience" height="100%">
          <text {...text}>{`§2${t('stats.guild.level')}:§f ${t(guild.level)}`}</text>
          <text {...text}>{`§2${t('stats.guild.gexpToNextLevel')}:§f ${t(
            guild.nextLevelExp
          )}`}</text>
          <text {...text}>{`§2${t('stats.guild.gexp')}:§f ${t(guild.exp)}`}</text>
          <text {...text}>{`§2${t('stats.guild.daily')}:§f ${t(guild.daily)}`}</text>
          <text {...text}>{`§2${t('stats.guild.weekly')}:§f ${t(guild.weekly)}`}</text>
          <text {...text}>{`§2${t('stats.guild.monthly')}:§f ${t(guild.monthly)}`}</text>
          <text {...text}>{`§2${t('stats.guild.avgMemberWeeklyGexp')}:§f ${t(
            ratio(guild.weekly, guild.members.length)
          )}`}</text>
        </GuildBlock>
        <GuildBlock title="GEXP History §8(§7Scaled §8|§7 Raw§8)" height="100%">
          {guild.expHistory.slice(0, 7).map((exp, index) => (
            <text {...text}>{`§8• §7${guild.expHistoryDays[index]}: §2${t(exp)} §8| §2${t(
              guild.scaledExpHistory[index]
            )}`}</text>
          ))}
        </GuildBlock>
        <div width="remaining" height="100%" direction="column">
          <GuildBlock title="Guild Achivements" width="100%">
            <text {...text}>{`§eWinners:§f ${t(guild.achievements.dailyGuildWins)}`}</text>
            <text {...text}>{`§eExperience Kings:§f ${t(guild.achievements.dailyGexp)}`}</text>
            <text {...text}>{`§eOnline Players:§f ${t(
              guild.achievements.maxOnlinePlayerCount
            )}`}</text>
          </GuildBlock>
          <GuildBlock title="Guild Quests" width="100%" height="remaining">
            <text {...text}>{`§b${t('stats.guild.questsCompleted')}:§f ${t(
              guild.questParticipation
            )}`}</text>
          </GuildBlock>
        </div>
      </div>
      <div width="100%">
        <GuildBlock title="Guild Ranks" width="remaining" height="100%">
          <div>
            {rankGroups.map((ranks) => (
              <div direction="column" margin={{ right: 6 }}>
                {ranks.map((rank) => (
                  <text {...text}>{`§8• ${guild.tagColor.code}${rank.name}${
                    rank.tag ? ` [${rank.tag}]` : ''
                  }`}</text>
                ))}
              </div>
            ))}
          </div>
        </GuildBlock>
        <GuildBlock title="Preferred Games" height="100%">
          {gameGroups.map((games) => (
            <div width="100%" location="left">
              {games.map((g, i) => (
                <img
                  image={g}
                  width={32}
                  height={32}
                  margin={{
                    top: 4,
                    bottom: 4,
                    left: i === 0 ? 0 : 4,
                    right: i === games.length - 1 ? 0 : 4,
                  }}
                />
              ))}
            </div>
          ))}
        </GuildBlock>
      </div>

      <Footer logo={logo} tier={tier} />
    </Container>
  );
};
