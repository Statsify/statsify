/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import Image from "next/image";
import { Box } from "./box";
import { ComponentProps } from "react";
import { cn } from "~/lib/util";

export function Skin({ uuid, contentClass, ...props }: ComponentProps<typeof Box> & { uuid: string }) {
  return (
    <Box {...props} contentClass={cn("relative flex justify-center min-w-[180px]", contentClass)}>
      <Image src={`https://api.statsify.net/skin?key=${process.env.API_KEY}&uuid=${uuid}`} fill alt="skin" className="object-top object-cover pointer-events-none" />
    </Box>
  );
}

