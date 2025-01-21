/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import Image from "next/image";
import { Box } from "./box";
import { cn } from "~/lib/util";

export function Skin({ uuid, className }: { uuid: string; className?: string }) {
  return (
    <Box contentClass={cn("relative flex justify-center min-w-[180px]", className)}>
      <Image src={`https://api.statsify.net/skin?key=${process.env.API_KEY}&uuid=${uuid}`} fill alt="skin" className="object-top object-cover pointer-events-none" />
    </Box>
  );
}
