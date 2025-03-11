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

export function Progression({ label, metric, progression, currentLevel, nextLevel, className }: {
  label: string;
  metric: string;
  progression: ProgressionSchema;
  currentLevel: string;
  nextLevel: string;
  className?: string;
}) {
  const max = 10;
  const count = Math.ceil(max * progression.percent);

  return (
    <Box containerClass={cn("text-mc-gray", className)}>
      <p>{label}: <MinecraftText>{currentLevel}</MinecraftText></p>
      <p>{metric} Progress: <span className="text-mc-aqua">{t(progression.current)}</span>/<span className="text-mc-green">{t(progression.max)}</span></p>
      <p>
        <MinecraftText>{currentLevel}</MinecraftText>
        {" "} <span className="text-mc-dark-gray">[</span><span className="text-mc-aqua">{"■".repeat(count)}</span>■{"■".repeat(max - count)}<span className="text-mc-dark-gray">]</span> {" "}
        <MinecraftText>{nextLevel}</MinecraftText>
      </p>
    </Box>
  );
}
