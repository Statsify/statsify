/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Box } from "./box";
import { MinecraftText } from "./minecraft-text";
import { cn } from "~/lib/util";
import type { ReactNode } from "react";

export function Nametag({ prefixName, head, className }: { prefixName: string; head?: ReactNode; className?: string }) {
  return (
    <Box className={cn("content:flex content:items-center content:justify-center content:gap-4", className)}>
      {head}
      <MinecraftText className="text-mc-3 lg:text-mc-4">{prefixName}</MinecraftText>
    </Box>
  );
}
