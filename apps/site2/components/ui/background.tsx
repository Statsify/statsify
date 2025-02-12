/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import BackgroundImage from "~/public/background.png";
import BedWarsImage from "~/public/bedwars.png";
import SkyWarsImage from "~/public/skywars.png";
import DuelsImage from "~/public/duels.png";
import ArcadeImage from "~/public/arcade.png";

import Image from "next/image";
import { cn } from "~/lib/util";

const Backgrounds = {
background:BackgroundImage,
bedwars:BedWarsImage,
skywars:SkyWarsImage,
duels:DuelsImage,
arcade:ArcadeImage,
}

export function Background({ background,className, mask }: { background:keyof typeof Backgrounds,className?: string; mask?: string }) {
  return (
    <div className={cn("absolute w-screen pointer-events-none -z-50", className)}>
      <Image
        src={Backgrounds[background]}
        alt=""
        fill={true}
        className="object-cover object-top brightness-85"
        style={{
          mask,
        }}
      />
      <div className="relative backdrop-blur-sm w-full h-full" />
    </div>
  );
}

