import { Container, Footer } from '#components';
import { LocalizeFunction } from '@statsify/discord';
import { useComponentWidth } from '@statsify/rendering';
import { Guild, GuildRank, UserTier } from '@statsify/schemas';
import type { Image } from 'skia-canvas/lib';

export interface GuildListProfileProps {
  guild: Guild;
  t: LocalizeFunction;
  background: Image;
  logo: Image;
  tier?: UserTier;
}

export const GuildListProfile = ({ guild, background, logo, tier, t }: GuildListProfileProps) => {
  // The width of each member row
  const WIDTH = 1000;

  const header = (
    <box width="100%">
      <text>§^4^{guild.nameFormatted}</text>
    </box>
  );

  //Hypixel does not always return all the ranks in `guild.ranks` so a special rank map is needed
  const rankMap: Record<string, string[]> = {};

  guild.members.forEach((member) => {
    rankMap[member.rank] = rankMap[member.rank] ?? [];
    rankMap[member.rank].push(member.displayName ?? 'ERROR');
  });

  //A map of the all the ranks in the guild
  const guildRankMap = guild.ranks.reduce((acc, rank) => {
    acc[rank.name] = rank;
    return acc;
  }, {} as Record<string, GuildRank>);

  const ranks = Object.entries(rankMap)
    .sort(
      ([rankNameA], [rankNameB]) =>
        (guildRankMap[rankNameB]?.priority ?? 0) - (guildRankMap[rankNameA]?.priority ?? 0)
    )
    .map(([rankName, members]) => {
      const guildRank = guildRankMap[rankName];

      const guildRankName = guildRank
        ? `${guildRank.name}${guildRank.tag ? ` [${guildRank.tag}]` : ''}`
        : rankName;

      const rows: JSX.Element[][] = [[]];
      let currentRowWidth = 0;

      for (let i = 0; i < members.length; i++) {
        const memberBox = (
          <box padding={{ left: 4, right: 4, top: 2, bottom: 2 }}>
            <text>{members[i]}</text>
          </box>
        );

        const memberBoxWidth = useComponentWidth(memberBox);
        const currentRow = rows.length - 1;

        if (currentRowWidth + memberBoxWidth > WIDTH) {
          rows.push([memberBox]);
          currentRowWidth = memberBoxWidth;
        } else {
          rows[currentRow].push(memberBox);
          currentRowWidth += memberBoxWidth;
        }
      }

      return (
        <div width="100%" direction="column">
          <box width="100%">
            <text>
              {guild.tagColor.code}
              {guildRankName} - {t(members.length)}
            </text>
          </box>
          <>
            {rows.map((row) => (
              <div width="100%">
                {row.map((r) => {
                  r.x.size = `1/${row.length}`;
                  return r;
                })}
              </div>
            ))}
          </>
        </div>
      );
    });

  return (
    <Container background={background}>
      {header}
      <>{ranks}</>
      <Footer logo={logo} tier={tier} />
    </Container>
  );
};
