/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Box } from "~/components/ui/box";
import { MotionValue, easeIn, easeOut, motion, useTransform } from "motion/react";
import { MotionValueTableData } from "~/components/ui/table";
import { Nametag } from "~/components/ui/nametag";
import { Skin } from "~/components/ui/skin";
import { useTranslation } from "react-i18next";
import { cn } from "~/lib/util";
import { formatDate, subDays } from "date-fns";
import { useNumberFormat } from "~/i18n/use-number-format";
import { usePlayer } from "~/components/player-context";
import type { PreviewIdentity } from "@statsify/contract";

export function WoolWarsPreview({ className, daysBack }: { className?: string; daysBack: MotionValue<number> }) {
  const player = usePlayer<PreviewIdentity>();
  const today = new Date();
  const { t } = useTranslation();

  const oldDate = useTransform(daysBack, (daysBack) => formatDate(subDays(today, daysBack), "MM/dd/yyyy"));

  // The bot's number format; the counts pass through fractions on their way, so they're rounded first.
  const n = useNumberFormat();
  const count = (value: number) => n(Math.round(value));

  const daysBackFormatted = useTransform(daysBack, count);

  const wins = useTransform(daysBack, [0, 3, 7], [0, 44, 132], { ease: easeIn });
  const losses = useTransform(daysBack, [0, 3, 7], [0, 21, 42], { ease: easeOut });
  const wlr = useTransform(() => wins.get() / (losses.get() || 1));

  const winsFormatted = useTransform(wins, count);
  const lossesFormatted = useTransform(losses, count);
  const wlrFormatted = useTransform(wlr, n);

  return (
    <div className={cn("grid grid-cols-3 gap-2 sm:whitespace-nowrap", className)}>
      <div className="col-span-3 grid grid-cols-[minmax(min-content,max-content)_1fr] lg:grid-cols-content-3 gap-2 text-center">
        <Skin uuid={player.uuid} className="hidden lg:block lg:col-span-1 lg:row-span-3" />
        <Nametag prefixName={player.prefixName} className="col-span-2 col-start-1 lg:col-start-2" />
        <Box className="col-span-2 content:text-mc-1.5 content:lg:text-mc-2">
          {/* "Today" differs between the cached HTML and the visitor's clock; the animation rewrites it anyway. */}
          Started <motion.span suppressHydrationWarning>{oldDate}</motion.span> (<motion.span>{daysBackFormatted}</motion.span> days ago)
        </Box>
        <Box className="font-bold content:flex content:items-center content:justify-center content:text-mc-1.5 content:lg:text-mc-2">
          Session
        </Box>
        <Box className="content:text-mc-1.5 content:lg:text-mc-2">
          <span className="font-bold">
            <span className="text-mc-red">Wool</span>
            <span className="text-mc-blue">Games</span> {t("home.stats")}
          </span>{" "}
          <wbr />
          <span className="hidden md:inline">(WoolWars)</span>
        </Box>
      </div>
      <MotionValueTableData title={t("default:stats.wins")} value={winsFormatted} color="text-mc-green" />
      <MotionValueTableData title={t("default:stats.losses")} value={lossesFormatted} color="text-mc-red" />
      <MotionValueTableData title="WLR" value={wlrFormatted} color="text-mc-gold" />
    </div>
  );
}
