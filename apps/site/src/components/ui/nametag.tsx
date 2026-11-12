/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Box } from "./box";
import { MinecraftText } from "./minecraft-text";

export function Nametag({ prefixName, className }: { prefixName: string; className?: string }) {
  return (
    <Box className={className}>
      <MinecraftText className="text-mc-3 lg:text-mc-4">{prefixName}</MinecraftText>
    </Box>
  );
}
