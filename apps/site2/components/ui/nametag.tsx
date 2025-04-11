/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Box } from "./box";
import { MinecraftText } from "./minecraft-text";
import { usePlayer } from "~/app/players/[slug]/context";

export function Nametag({ className }: { className?: string }) {
  const player = usePlayer();

  return (
    <Box containerClass={className}>
      <MinecraftText className="text-mc-4">{player.prefixName}</MinecraftText>
    </Box>
  );
}
