/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Box } from "./box";
import { MinecraftText } from "./minecraft-text";
import { formatNumber } from "~/i18n/format";
import { useTranslation } from "react-i18next";
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
  const { i18n } = useTranslation();

  return (
    <Box className={`text-mc-gray ${className}`}>
      <p>{label}: <MinecraftText>{currentLevel}</MinecraftText></p>
      <p>{metric} Progress: <span className="text-mc-aqua">{formatNumber(progression.current, i18n.language)}</span>/<span className="text-mc-green">{formatNumber(progression.max ?? 0, i18n.language)}</span></p>
      <p>
        <MinecraftText>{naturalLevel} {xpBar(progression.percent)} {nextLevel}</MinecraftText>
      </p>
    </Box>
  );
}
