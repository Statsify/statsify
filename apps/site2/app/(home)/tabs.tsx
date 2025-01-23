/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

"use client";

import { ArcadePreview } from "./previews/arcade";
import { BedWarsPreview } from "./previews/bedwars";
import { Box } from "~/components/ui/box";
import { DuelsPreview } from "./previews/duels";
import { SkyWarsPreview } from "./previews/skywars";
import { cn } from "~/lib/util";
import { useState } from "react";

export function Tabs() {
  const [activeTab, setActiveTab] = useState<"bedwars" | "skywars" | "duels" | "arcade">("skywars");

  return (
    <>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 text-center">
        <button aria-pressed={activeTab === "bedwars"} className="aria-pressed:font-bold" type="button" onClick={() => setActiveTab("bedwars")}><Box borderRadius={{ bottom: 0 }}>BedWars</Box></button>
        <button aria-pressed={activeTab === "skywars"} className="aria-pressed:font-bold" type="button" onClick={() => setActiveTab("skywars")}><Box borderRadius={{ bottom: 0 }}>SkyWars</Box></button>
        <button aria-pressed={activeTab === "duels"} className="aria-pressed:font-bold" type="button" onClick={() => setActiveTab("duels")}><Box borderRadius={{ bottom: 0 }}>Duels</Box></button>
        <button aria-pressed={activeTab === "arcade"} className="aria-pressed:font-bold" type="button" onClick={() => setActiveTab("arcade")}><Box borderRadius={{ bottom: 0 }}>Arcade</Box></button>
      </div>
      <div className="grid grid-areas-stack">
        <BedWarsPreview className={cn("grid-area-stack invisible", activeTab === "bedwars" && "visible")} />
        <SkyWarsPreview className={cn("grid-area-stack invisible", activeTab === "skywars" && "visible")} />
        <DuelsPreview className={cn("grid-area-stack invisible", activeTab === "duels" && "visible")} />
        <ArcadePreview className={cn("grid-area-stack invisible", activeTab === "arcade" && "visible")} />
      </div>
    </>
  );
}
