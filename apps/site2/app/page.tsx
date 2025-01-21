/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Background } from "~/components/ui/background";
import { Box } from "~/components/ui/box";
import { MinecraftText } from "~/components/ui/minecraft-text";
import { Skin } from "~/components/ui/skin";
import { TableData } from "~/components/ui/table";
import { Ticker } from "~/components/ui/ticker";

export default function Home() {
  return (
    <div>
      <Background />
      <div className="relative flex justify-between items-center h-[80dvh]">
        <div className="relative flex flex-col gap-10 justify-center w-1/2 h-fit px-16 py-16 text-mc-white">
          <div className="flex flex-col gap-3">
            <div className="text-mc-8"><span className="text-[#D0EEFC]">S</span><span className="text-[#8EC3E7]">t</span><span className="text-[#4C97D2]">a</span><span className="text-[#418DCC]">t</span><span className="text-[#3784C5]">s</span><span className="text-[#2C7ABF]">i</span><span className="text-[#2171B8]">f</span><span className="text-[#1668B1]">y</span></div>
            <div className="text-mc-3">Statsify is the most advanced bot in 2025</div>
          </div>
          <div className="w-1/2 h-16 flex items-center px-4 gap-4 bg-white/30 border-4 border-white/40">
            <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-8 text-white drop-shadow-mc-2">
              <path d="M6 2h8v2H6V2zM4 6V4h2v2H4zm0 8H2V6h2v8zm2 2H4v-2h2v2zm8 0v2H6v-2h8zm2-2h-2v2h2v2h2v2h2v2h2v-2h-2v-2h-2v-2h-2v-2zm0-8h2v8h-2V6zm0 0V4h-2v2h2z" fill="currentColor" />
            </svg>
            <input placeholder="Search your stats" className="text-mc-2 placeholder-mc-darkgray text-white outline-none h-full w-full selection:bg-white/50" spellCheck={false} />
          </div>
          <div
            className="bg-black/50 w-full h-full absolute -z-20 left-0 backdrop-blur-lg"
            style={{
              mask: "linear-gradient(90deg, rgb(255 255 255) 10%, rgb(0 0 0 / 0) 100%)",
            }}
          />
        </div>
        <div className="relative flex gap-2 overflow-hidden mr-16">
          <Ticker direction="positive" className="flex flex-col gap-2 max-h-[500px]">
            <TableData title="Wins" value="3,676" color="text-mc-green" />
            <TableData title="Losses" value="3,536" color="text-mc-red" />
            <TableData title="WLR" value="1.04" color="text-mc-gold" />
            <TableData title="Wins" value="3,676" color="text-mc-green" />
            <TableData title="Losses" value="3,536" color="text-mc-red" />
            <TableData title="WLR" value="1.04" color="text-mc-gold" />
            <Skin
              uuid="618a96fec8b0493fa89427891049550b"
              className="h-40"
            />
          </Ticker>
          <Ticker direction="negative" className="flex flex-col gap-2 max-h-[500px]">
            <Box contentClass="flex flex-col justify-center gap-2">
              <p><span className="text-mc-dark-green">●</span> Tokens: <span className="text-mc-dark-green">846,942</span></p>
              <p><span className="text-mc-gray">●</span> Iron: <span className="text-mc-gray">1.26M</span></p>
              <p><span className="text-mc-gold">●</span> Gold: <span className="text-mc-gold">202,077</span></p>
              <p><span className="text-mc-aqua">●</span> Diamonds: <span className="text-mc-aqua">28,706</span></p>
              <p><span className="text-mc-dark-green">●</span> Emeralds: <span className="text-mc-dark-green">11,542</span></p>
              <p><span className="text-mc-green">●</span> Winstreak: <span className="text-mc-green">2</span></p>
            </Box>
            <TableData title="Deaths" value="100" color="text-mc-red" />
            <TableData title="KDR" value="100" color="text-mc-gold" />
          </Ticker>
          <Ticker direction="positive" className="flex flex-col gap-2 max-h-[500px]">
            <Box containerClass="text-mc-gray text-center" contentClass="flex items-center gap-2 justify-center">
              <MinecraftText className="text-mc-3">§b[MVP§4+§b] j4cobi</MinecraftText>
              <MinecraftText>§7[GTB]</MinecraftText>
            </Box>
            <Box containerClass="text-mc-gray text-center">
              <p>Title: <MinecraftText>§l§5Godlike V</MinecraftText></p>
              <p>Win Progress: <span className="text-mc-aqua">2,641</span>/<span className="text-mc-green">3,000</span></p>
              <p>
                <MinecraftText>§l§5[V]</MinecraftText>
                {" "} <span className="text-mc-dark-gray">[</span><span className="text-mc-aqua">■■■■■■■</span>■■■<span className="text-mc-dark-gray">]</span> {" "}
                <MinecraftText>§l§b[I]</MinecraftText>
              </p>
            </Box>
            <TableData title="Weekly GEXP" value="92,053" color="text-mc-dark-green" />
          </Ticker>
        </div>
      </div>
      <div className="h-full text-mc-2 text-white flex gap-4 items-center">
        <button className="text-nowrap h-16 bg-[#5865F2] border-4 border-[color-mix(in_srgb,_#5865F2_50%,_rgb(0_0_0)_15%)] text-mc-2 text-white outline-none px-4">Try on Discord</button>
      </div>
    </div>
  );
}

