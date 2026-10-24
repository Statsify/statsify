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
import { MinecraftText } from "~/components/ui/minecraft-text";
import { SkinHead } from "~/components/ui/skin";
import { cn } from "~/lib/util";
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

  // Position and head are `max-content`, the name column shrinks and truncates, the values are
  // `max-content`, so a long name never widens the page at 375 px.
  return (
    <div
      className={cn(
        "grid text-center gap-2 whitespace-nowrap grid-cols-[max-content_max-content_minmax(0,1fr)_repeat(var(--fields),max-content)]",
        className
      )}
      style={{ "--fields": leaderboard.fields.length } as CSSProperties}
    >
      <div className="col-span-full">
        <Box>
          <Link to="/{-$locale}/leaderboards/$field" params={{ field: leaderboard.field }} className="hover:underline">
            <MinecraftText className="font-bold text-mc-3 md:text-mc-4">{leaderboard.name}</MinecraftText>
          </Link>
        </Box>
      </div>
      <Box className={`hidden md:block ${HEADER}`}>Pos</Box>
      <Box className={`col-span-3 md:col-span-2 ${HEADER}`}>Player</Box>
      {leaderboard.fields.map((field) => (
        <Box key={field} className={HEADER}>
          {field}
        </Box>
      ))}
      {leaderboard.rows.slice(0, 3).map((row) => (
        <Fragment key={row.uuid}>
          <Box className="hidden md:block content:font-bold content:flex content:items-center content:justify-center">
            #{row.position}
          </Box>
          <Box className="hidden md:block content:py-3 content:px-5">
            <SkinHead uuid={row.uuid} />
          </Box>
          <Box className="col-span-3 md:col-span-1 min-w-0 content:min-w-0 content:text-start justify-center content:flex content:items-center">
            {/* `MinecraftText` styles every colour segment, so the truncation sits on a wrapper. */}
            <span className="block min-w-0 truncate">
              <Link to="/{-$locale}/player/$name" params={{ name: row.username }} className="hover:underline">
                <MinecraftText className="text-mc-1.5 lg:text-mc-2">{row.name}</MinecraftText>
              </Link>
            </span>
          </Box>
          {row.values.map((value, index) => (
            <Box
              key={`${leaderboard.fields[index]}-${row.uuid}`}
              className="content:flex content:justify-center content:items-center"
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
