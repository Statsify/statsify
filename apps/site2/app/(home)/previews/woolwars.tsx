/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

"use client";

import { Box } from "~/components/ui/box";
import { MotionValue, easeIn, easeOut, motion, useTransform } from "motion/react";
import { MotionValueTableData } from "~/components/ui/table";
import { Nametag } from "~/components/ui/nametag";
import { Skin } from "~/components/ui/skin";
import { cn } from "~/lib/util";
import { formatDate, subDays } from "date-fns";
import { usePlayer } from "~/app/players/[slug]/context";

export function WoolWarsPreview({ className, daysBack }: { className?: string; daysBack: MotionValue<number> }) {
  const player = usePlayer();
  const today = new Date();

  const oldDate = useTransform(daysBack, (daysBack) => formatDate(subDays(today, daysBack), "MM/dd/yyyy"));

  const intFormatter = Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  });

  const decimalFormatter = Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });

  const daysBackFormatted = useTransform(daysBack, intFormatter.format.bind(intFormatter));

  const wins = useTransform(daysBack, [0, 3, 7], [0, 44, 132], { ease: easeIn });
  const losses = useTransform(daysBack, [0, 3, 7], [0, 21, 42], { ease: easeOut });
  const wlr = useTransform(() => wins.get() / (losses.get() || 1));

  const winsFormatted = useTransform(wins, intFormatter.format.bind(intFormatter));
  const lossesFormatted = useTransform(losses, intFormatter.format.bind(intFormatter));
  const wlrFormatted = useTransform(wlr, decimalFormatter.format.bind(decimalFormatter));

  return (
    <div className={cn("grid grid-cols-3 gap-2 whitespace-nowrap", className)}>
      <div className="col-span-3 grid grid-cols-content-2 lg:grid-cols-content-3 gap-2 text-center">
        <Skin uuid={player.uuid} className="container:hidden container:lg:block container:lg:col-span-1 container:lg:row-span-3 h-full" />
        <Nametag className="container:col-span-2 container:col-start-1 container:lg:col-start-2" />
        <Box className="container:col-span-2">
          Started <motion.span>{oldDate}</motion.span> (<motion.span>{daysBackFormatted}</motion.span> days ago)
        </Box>
        <Box className="container:font-bold">Session</Box>
        <Box>
          <span className="font-bold">
            <span className="text-mc-red">Wool</span>
            <span className="text-mc-blue">Games</span> Stats
          </span>{" "}
          <span className="text-mc-1.5 lg:text-mc-2">(WoolWars)</span>
        </Box>
      </div>
      <MotionValueTableData title="Wins" value={winsFormatted} color="text-mc-green" />
      <MotionValueTableData title="Losses" value={lossesFormatted} color="text-mc-red" />
      <MotionValueTableData title="WLR" value={wlrFormatted} color="text-mc-gold" />
    </div>
  );
}
