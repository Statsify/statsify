/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { usePlayer } from "~/app/players/[slug]/context";

import { Box } from "./box";
import { MinecraftText } from "./minecraft-text";

export function Nametag({ className }: { className?: string }) {
  const player = usePlayer();

  return (
    <Box className={className}>
      <MinecraftText className="text-mc-3 lg:text-mc-4">{player.prefixName}</MinecraftText>
    </Box>
  );
}
