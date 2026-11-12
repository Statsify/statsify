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
import { Skin, SkinHead } from "~/components/ui/skin";
import { useHydrated } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { cn } from "~/lib/util";
import { useNumberFormat } from "~/i18n/use-number-format";
import { usePlayer } from "~/components/player-context";
import type { PreviewIdentity } from "@statsify/contract";

/** The date `days` before `today` as MM/dd/yyyy, by hand: a date library would cost the home page 6 KB for this. */
function daysBefore(today: Date, days: number) {
  const date = new Date(today);
  date.setDate(date.getDate() - days);
  return `${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}/${date.getFullYear()}`;
}

export function WoolWarsPreview({ className, daysBack }: { className?: string; daysBack: MotionValue<number> }) {
  const player = usePlayer<PreviewIdentity>();
  const hydrated = useHydrated();
  const { t } = useTranslation();

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
        <Nametag prefixName={player.prefixName} head={<SkinHead uuid={player.uuid} className="shrink-0 lg:hidden" />} className="col-span-2 col-start-1 lg:col-start-2" />
        <Box className="col-span-2 content:text-mc-1.5 content:lg:text-mc-2">
          {/* Hydration keeps the cached HTML's "today", so the span remounts once the visitor's clock can be read. */}
          Started <span key={hydrated ? "visitor" : "cached"} suppressHydrationWarning>{daysBefore(new Date(), 7)}</span> (<motion.span>{daysBackFormatted}</motion.span> days ago)
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
