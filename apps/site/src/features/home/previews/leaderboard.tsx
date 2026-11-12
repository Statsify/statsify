/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Box } from "~/components/ui/box";
import { Fragment } from "react";
import { Link } from "@tanstack/react-router";
import { MinecraftText, plainText } from "~/components/ui/minecraft-text";
import { SkinHead } from "~/components/ui/skin";
import { cn } from "~/lib/util";
import { PhoneRows } from "~/features/leaderboards/leaderboard-boxes";
import { useColumnLabel } from "~/features/leaderboards/leaderboard-table";
import { useNumberFormat } from "~/i18n/use-number-format";
import type { CSSProperties } from "react";
import type { LeaderboardPage } from "@statsify/contract";

// Everything is Minecraft, as on the live site; the column headers are bold.
const HEADER = "content:font-bold";

/** The top three rows of the sample leaderboard, straight from the contract's `leaderboard.page` shape. */
export function LeaderboardPreview({
  leaderboard,
  className,
}: {
  leaderboard: LeaderboardPage;
  className?: string;
}) {
  const n = useNumberFormat();
  const label = useColumnLabel();

  // From `md`, position and head are `max-content`, the name column shrinks and truncates, the values are
  // `max-content`, so a long name never widens the page. Below it, the rows are the leaderboard page's phone rows.
  return (
    <div
      className={cn(
        "grid text-center gap-2 whitespace-nowrap grid-cols-[max-content_max-content_minmax(0,1fr)_repeat(var(--fields),max-content)]",
        className
      )}
      style={{ "--fields": leaderboard.columns.length } as CSSProperties}
    >
      <div className="col-span-full">
        <Box>
          <Link to="/{-$locale}/leaderboards/$field" params={{ field: leaderboard.field }} className="hover:underline">
            <MinecraftText className="font-bold text-mc-3 md:text-mc-4">{plainText(leaderboard.formatted)}</MinecraftText>
          </Link>
        </Box>
      </div>
      <div className="col-span-full md:hidden whitespace-normal">
        <PhoneRows page={leaderboard} />
      </div>
      <Box className={`max-md:hidden ${HEADER}`}>Pos</Box>
      <Box className={`max-md:hidden col-span-2 ${HEADER}`}>Player</Box>
      {leaderboard.columns.map((column) => (
        <Box key={column.field} className={`max-md:hidden ${HEADER}`}>
          {label(column)}
        </Box>
      ))}
      {leaderboard.rows.slice(0, 3).map((row) => (
        <Fragment key={row.uuid}>
          <Box className="max-md:hidden content:font-bold content:flex content:items-center content:justify-center">
            #{row.position}
          </Box>
          <Box className="max-md:hidden content:py-3 content:px-5">
            <SkinHead uuid={row.uuid} />
          </Box>
          <Box className="max-md:hidden min-w-0 content:min-w-0 content:text-start justify-center content:flex content:items-center">
            {/* `MinecraftText` styles every color segment, so the truncation sits on a wrapper. */}
            <span className="block min-w-0 truncate">
              <Link to="/{-$locale}/player/$name" params={{ name: row.username }} className="hover:underline">
                <MinecraftText className="text-mc-1.5 lg:text-mc-2">{row.name}</MinecraftText>
              </Link>
            </span>
          </Box>
          {row.values.map((value, index) => (
            <Box
              key={`${leaderboard.columns[index].field}-${row.uuid}`}
              className="max-md:hidden content:flex content:justify-center content:items-center"
            >
              {typeof value === "number" ?
                <span className="text-mc-1.5 lg:text-mc-2">{n(value)}</span> :
                <MinecraftText className="text-mc-1.5 lg:text-mc-2">{value}</MinecraftText>}
            </Box>
          ))}
        </Fragment>
      ))}
    </div>
  );
}
