/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Box } from "./box";
import { MinecraftText } from "./minecraft-text";
import { useNumberFormat } from "~/i18n/use-number-format";
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
  className = "",
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
  const n = useNumberFormat();

  // The previews are no-wrap grids; these lines may wrap when a phone is too narrow.
  return (
    <Box className={`text-mc-gray content:whitespace-normal ${className}`}>
      <p>{label}: <MinecraftText>{currentLevel}</MinecraftText></p>
      <p>{metric} Progress: <span className="text-mc-aqua">{n(progression.current)}</span>/<span className="text-mc-green">{n(progression.max ?? 0)}</span></p>
      <p>
        <MinecraftText>{naturalLevel} {xpBar(progression.percent)} {nextLevel}</MinecraftText>
      </p>
    </Box>
  );
}
