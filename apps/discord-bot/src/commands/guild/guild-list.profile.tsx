/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Container, Footer } from "#components";
import { Guild, GuildRank, User } from "@statsify/schemas";
import { LocalizeFunction } from "@statsify/discord";
import { useComponentWidth } from "@statsify/rendering";
import type { Image } from "skia-canvas";

export interface GuildListProfileProps {
  guild: Guild;
  t: LocalizeFunction;
  background: Image;
  logo: Image;
  user: User | null;
}

export const GuildListProfile = ({
  guild,
  background,
  logo,
  user,
  t,
}: GuildListProfileProps) => {
  // The width of each member row
  const WIDTH = 1600;

  const header = (
    <box width="100%">
      <text>§^4^{guild.nameFormatted}</text>
    </box>
  );

  //Hypixel does not always return all the ranks in `guild.ranks` so a special rank map is needed
  const rankMap: Record<string, string[]> = {};

  guild.members.forEach((member) => {
    rankMap[member.rank] = rankMap[member.rank] ?? [];
    rankMap[member.rank].push(member.displayName ?? "ERROR");
  });

  //A map of the all the ranks in the guild
  const guildRankMap = guild.ranks.reduce((acc, rank) => {
    acc[rank.name] = rank;
    return acc;
  }, {} as Record<string, GuildRank>);

  const ranks = Object.entries(rankMap)
    .sort(
      ([rankNameA], [rankNameB]) =>
        (guildRankMap[rankNameB]?.priority ?? 0) -
        (guildRankMap[rankNameA]?.priority ?? 0)
    )
    .map(([rankName, members]) => {
      const guildRank = guildRankMap[rankName];

      const guildRankName = guildRank
        ? `${guildRank.name}${guildRank.tag ? ` [${guildRank.tag}]` : ""}`
        : rankName;

      const rows: JSX.Element[][] = [[]];
      let currentRowWidth = 0;

      for (const member of members) {
        const memberBox = (
          <box padding={{ left: 10, right: 10, top: 4, bottom: 4 }}>
            <text margin={0}>{member}</text>
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
              <div width="100%">{row}</div>
            ))}
          </>
        </div>
      );
    });

  return (
    <Container background={background}>
      {header}
      <>{ranks}</>
      <Footer logo={logo} user={user} />
    </Container>
  );
};
