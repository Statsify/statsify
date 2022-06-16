import {
  Container,
  Footer,
  formatProgression,
  If,
  Multiline,
  ProgressFunction,
  Table,
} from '#components';
import { LocalizeFunction } from '@statsify/discord';
import { ratio } from '@statsify/math';
import { StyleLocation } from '@statsify/rendering';
import { Guild, GuildMember, UserTier } from '@statsify/schemas';
import { wordGroup } from '@statsify/util';
import { DateTime } from 'luxon';
import type { Image } from 'skia-canvas';

const LINK_REGEX =
  /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)|[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/g;

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

const text: JSX.IntrinsicElements['text'] = {
  align: 'left' as StyleLocation,
  margin: { top: 1, bottom: 1 },
};

const box: JSX.IntrinsicElements['box'] = {
  padding: { left: 8, right: 8, top: 4, bottom: 4 },
  width: '100%',
  height: 'remaining',
  direction: 'column',
};

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
  page: 'overall' | 'gexp';
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
  page,
}: GuildProfileProps) => {
  let pageEl: JSX.Element;

  switch (page) {
    case 'gexp':
      pageEl = <GuildGexpPage guild={guild} t={t} />;
      break;
    default:
    case 'overall':
      pageEl = (
        <GuildOverallPage
          guild={guild}
          t={t}
          guildMaster={guildMaster}
          skin={skin}
          ranking={ranking}
          games={games}
        />
      );
      break;
  }

  return (
    <Container background={background}>
      <box width="100%">
        <text>§^4^{guild.nameFormatted}</text>
      </box>
      {pageEl}
      <Footer logo={logo} tier={tier} />
    </Container>
  );
};

interface GuildOverallPageProps {
  guild: Guild;
  guildMaster: GuildMember;
  skin: Image;
  games: Image[];
  t: LocalizeFunction;
  ranking: number;
}

const GuildOverallPage = ({
  guild,
  games,
  guildMaster,
  ranking,
  skin,
  t,
}: GuildOverallPageProps) => {
  const format = "LL/dd/yy',' hh:mm a";
  const createdAt = DateTime.fromMillis(guild.createdAt).toFormat(format, { locale: t.locale });

  return (
    <>
      <div width="100%">
        <GuildBlock title="Guild Info" width="remaining" height="100%">
          <box {...box}>
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
            <text {...text}>{`§2${t('stats.guild.level')}:§f ${t(guild.level)}`}</text>
          </box>
        </GuildBlock>
        <If condition={guild.description}>
          {(description) => (
            <GuildBlock title="Guild Description" height="100%">
              <box {...box}>
                {wordGroup(description, 10).map((m) => (
                  <text {...text}>{m.replace(LINK_REGEX, (match) => `§b§u${match}§r`)}</text>
                ))}
              </box>
            </GuildBlock>
          )}
        </If>
      </div>
      <GuildBlock title="Guild Experience" width="100%">
        <Table.table>
          <Table.tr>
            <Table.td title={t('stats.guild.daily')} value={t(guild.daily)} color="§2" />
            <Table.td title={t('stats.guild.weekly')} value={t(guild.weekly)} color="§2" />
            <Table.td title={t('stats.guild.monthly')} value={t(guild.monthly)} color="§2" />
          </Table.tr>
        </Table.table>
      </GuildBlock>
      <If condition={games.length > 0}>
        <GuildBlock title="Preferred Games" width="100%">
          <box {...box} direction="row">
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
  const progression: ProgressFunction = (percentage) => {
    const max = 40;
    const count = Math.ceil(max * percentage);

    return `§8[${guild.tagColor.code}${'|'.repeat(count)}§7${'|'.repeat(max - count)}§8]§r`;
  };

  const leveling = `§7${t('stats.guild.level')}: ${guildColor}${t(
    guild.level
  )}\n${formatProgression(
    t,
    guild.levelProgression,
    `${guildColor}${t(Math.floor(guild.level))}`,
    `${guildColor}${t(Math.floor(guild.level) + 1)}`,
    true,
    progression
  )}`;

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
            <Table.td title={t('stats.guild.daily')} value={t(guild.daily)} color="§2" />
            <Table.td title={t('stats.guild.weekly')} value={t(guild.weekly)} color="§2" />
            <Table.td title={t('stats.guild.monthly')} value={t(guild.monthly)} color="§2" />
          </Table.tr>
        </Table.table>
      </GuildBlock>
      <GuildBlock title={t('stats.guild.averageMemberGexp')} width="100%">
        <Table.table>
          <Table.tr>
            <Table.td
              title={t('stats.guild.daily')}
              value={t(ratio(guild.daily, guild.members.length))}
              color="§2"
              size="small"
            />
            <Table.td
              title={t('stats.guild.weekly')}
              value={t(ratio(guild.weekly, guild.members.length))}
              color="§2"
              size="small"
            />
            <Table.td
              title={t('stats.guild.monthly')}
              value={t(ratio(guild.monthly, guild.members.length))}
              color="§2"
              size="small"
            />
          </Table.tr>
        </Table.table>
      </GuildBlock>
      <GuildBlock title="GEXP History" width="100%">
        <Table.table>
          <Table.tr>
            <box width="100%" border={{ topLeft: 4, bottomLeft: 4, bottomRight: 0, topRight: 0 }}>
              <text>§7§l{t('stats.guild.date')}</text>
            </box>
            <box width="100%" border={{ topLeft: 0, bottomLeft: 0, bottomRight: 0, topRight: 0 }}>
              <text>§2§l{t('stats.guild.gexp')}</text>
            </box>
            <box width="100%" border={{ topLeft: 0, bottomLeft: 0, bottomRight: 4, topRight: 4 }}>
              <text>§2§l{t('stats.guild.scaledGexp')}</text>
            </box>
          </Table.tr>
          <>
            {guild.expHistory.slice(0, 7).map((exp, i) => (
              <Table.tr>
                <box
                  width="100%"
                  border={{ topLeft: 4, bottomLeft: 4, bottomRight: 0, topRight: 0 }}
                >
                  <text>§f{guild.expHistoryDays[i].replace(/-/g, '§7-§f')}</text>
                </box>
                <box
                  width="100%"
                  border={{ topLeft: 0, bottomLeft: 0, bottomRight: 0, topRight: 0 }}
                >
                  <text>§2{t(exp)}</text>
                </box>
                <box
                  width="100%"
                  border={{ topLeft: 0, bottomLeft: 0, bottomRight: 4, topRight: 4 }}
                >
                  <text>§2{t(guild.scaledExpHistory[i])}</text>
                </box>
              </Table.tr>
            ))}
          </>
        </Table.table>
      </GuildBlock>
    </>
  );
};
