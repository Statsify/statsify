/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Box } from "./box";
import { MinecraftText } from "./minecraft-text";
import { cn } from "~/lib/util";
import { t } from "~/localize";
import type { Progression as ProgressionSchema } from "@statsify/schemas";

const minigameXpBar = (percentage: number) => {
  const max = 10;
  const count = Math.ceil(max * percentage);
  return `§8[§b${"■".repeat(count)}§7${"■".repeat(max - count)}§8]`;
};

export function Progression({
  label,
  metric,
  progression,
  currentLevel,
  naturalLevel = currentLevel,
  nextLevel,
  className,
  xpBar = minigameXpBar,
}: {
  label: string;
  metric: string;
  progression: ProgressionSchema;
  currentLevel: string;
  naturalLevel?: string;
  nextLevel: string;
  xpBar?: (percentage: number) => string;
  className?: string;
}) {
  return (
    <Box containerClass={cn("text-mc-gray", className)}>
      <p>{label}: <MinecraftText>{currentLevel}</MinecraftText></p>
      <p>{metric} Progress: <span className="text-mc-aqua">{t(progression.current)}</span>/<span className="text-mc-green">{t(progression.max)}</span></p>
      <p>
        <MinecraftText>{naturalLevel} {xpBar(progression.percent)} {nextLevel}</MinecraftText>
      </p>
    </Box>
  );
}
