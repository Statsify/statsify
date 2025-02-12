"use client";

import { useState } from "react";
import { cn } from "~/lib/util";
import { BedWarsPreview } from "../previews/bedwars";
import { SkyWarsPreview } from "../previews/skywars";
import { DuelsPreview } from "../previews/duels";
import { ArcadePreview } from "../previews/arcade";
import type { Player } from "@statsify/schemas";
import { Background } from "~/components/ui/background";
import { Command } from "~/components/ui/command";
import { PlayerProvider } from "~/app/players/[slug]/context";
import { Box } from "~/components/ui/box";

type Tab = "bedwars" | "skywars" | "duels" | "arcade";

export function PlayerSection({ player}:{player:Player}) {
  const [activeTab, setActiveTab] = useState<Tab>("skywars");

	return (
		 <section className="w-full relative grid grid-rows-[1fr_8fr_1fr] justify-stretch">
						<Background className="w-full h-full" background={activeTab} />
						<div
							className="absolute w-full h-full -z-10"
							style={{
								background: "linear-gradient(0deg, rgba(17,17,17,1) 10%, rgba(17,17,17,0) 50%, rgba(17,17,17,1) 90%)",
							}}
						/>
						<div className="min-h-1" />
						<div className="flex justify-center">
							<div className="w-full max-w-[1800px] flex flex-col lg:flex-row justify-around lg:items-center gap-8 pt-8 lg:pt-0">
								<div className="mx-auto lg:mx-0 flex flex-col gap-4 max-w-100 xl:max-w-120 text-mc-white text-center lg:text-start ">
									<h1 className="text-mc-4 lg:text-mc-7 font-bold text-mc-yellow">Players</h1>
									<p className="text-mc-2 leading-6">Beautiful visuals are provided by Statsify for every game on Hypixel. Simply input <Command>/bedwars</Command> into Discord to see your BedWars stats or those of your friends. To see further games, type / followed by the name of the game. To quickly search for yourself, you may link your Minecraft account to your Discord with <Command>/verify</Command></p>
								</div>
								<div
									className="relative w-full lg:w-fit h-full flex flex-col justify-center items-center gap-8 p-4 lg:p-8 before:absolute before:bg-gradient-to-b before:from-white/20 before:to-white/50 before:mix-blend-overlay before:w-full before:h-full before:-z-20 after:mix-blend-overlay after:w-full after:h-full after:content-[''] after:absolute after:shadow-[0_0_10px_white,0_0_30px_10px_white] after:shadow-white after:-z-20"
								>
									<PlayerProvider player={player}>
										<Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
									</PlayerProvider>
								</div>
							</div>
						</div>
						<div className="min-h-1" />
					</section>);
}

function Tabs({activeTab,setActiveTab}:{activeTab:Tab; setActiveTab: (activeTab: Tab)=>void}) {

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