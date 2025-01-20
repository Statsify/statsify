/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import BackgroundImage from "../public/background.png";
import Image from "next/image";
import { Background } from "~/components/ui/background";
import { Box } from "~/components/ui/box";

export default function Home() {
  return (
    <div className="flex justify-center text-[32px] leading-[normal] ">
      <Background />
      <div className="grid grid-cols-3 w-fit gap-4">
        <div className="col-span-3 flex gap-4">
          <Box contentClass="relative flex justify-center text-mc-blue w-[180px] h-full">
            <Image src="https://api.statsify.net/skin?key=KEY&uuid=96f645ba026b4e45bc34dd8f0531334c" fill alt="skin" className="object-top object-cover" />
          </Box>
          <div className="flex flex-col gap-4 grow text-center">
            <Box><span className="text-mc-aqua text-mc-4">Amony</span></Box>
            <Box containerClass="text-mc-gray">
              <p>Level: [<span className="text-mc-yellow">1214</span><span className="text-mc-gold">✪</span>]</p>
              <p>EXP Progress: <span className="text-mc-aqua">3,197</span>/<span className="text-mc-green">5,000</span></p>
              <p>[<span className="text-mc-yellow">1214</span><span className="text-mc-gold">✪</span>] <span className="text-mc-dark-gray">[</span><span className="text-mc-aqua">■■■■■■■</span>■■■<span className="text-mc-dark-gray">]</span> [<span className="text-mc-yellow">1215</span><span className="text-mc-gold">✪</span>]</p>
            </Box>
            <Box>
              <span className="font-bold"><span className="text-mc-red">Bed</span>Wars Stats</span> (Overall)
            </Box>
          </div>
          <Box contentClass="flex flex-col justify-center gap-2">
            <p><span className="text-mc-dark-green">●</span> Tokens: <span className="text-mc-dark-green">13.16M</span></p>
            <p><span className="text-mc-gray">●</span> Iron: <span className="text-mc-gray">1.87M</span></p>
            <p><span className="text-mc-gold">●</span> Gold: <span className="text-mc-gold">295,786</span></p>
            <p><span className="text-mc-aqua">●</span> Diamonds: <span className="text-mc-aqua">61,834</span></p>
            <p><span className="text-mc-dark-green">●</span> Emeralds: <span className="text-mc-dark-green">15,200</span></p>
            <p><span className="text-mc-aqua">●</span> Slumber Tickets: <span className="text-mc-aqua">47,516<span className="text-mc-gray">/100,000</span></span></p>
            <p><span className="text-mc-pink">●</span> Total Slumber Tickets: <span className="text-mc-pink">320,391</span></p>
            <p><span className="text-mc-green">●</span> Winstreak: <span className="text-mc-green">2</span></p>
          </Box>
        </div>
        <TableData title="Wins" value="8,056" color="text-mc-green" />
        <TableData title="Losses" value="1,656" color="text-mc-red" />
        <TableData title="WLR" value="4.86" color="text-mc-gold" />
        <TableData title="Final Kills" value="27,210" color="text-mc-green" />
        <TableData title="Final Deaths" value="1,919" color="text-mc-red" />
        <TableData title="FKDR" value="14.18" color="text-mc-gold" />
        <TableData title="Kills" value="37,105" color="text-mc-green" />
        <TableData title="Deaths" value="39,353" color="text-mc-red" />
        <TableData title="KDR" value="0.94" color="text-mc-gold" />
        <TableData title="Beds Broken" value="12,120" color="text-mc-green" />
        <TableData title="Beds Lost" value="2,775" color="text-mc-red" />
        <TableData title="BBLR" value="4.37" color="text-mc-gold" />
        <Box
          borderRadius={{ top: 0 }}
          containerClass="col-span-3 text-mc-blue"
          contentClass="flex justify-center"
        >
          <span className="text-[#D0EEFC]">s</span><span className="text-[#AFD8F2]">t</span><span className="text-[#8EC3E7]">a</span><span className="text-[#6DADDD]">t</span><span className="text-[#4C97D2]">s</span><span className="text-[#418DCC]">i</span><span className="text-[#3784C5]">f</span><span className="text-[#2C7ABF]">y</span><span className="text-[#2776BC]">.</span><span className="text-[#2171B8]">n</span><span className="text-[#1C6DB5]">e</span><span className="text-[#1668B1]">t</span>
        </Box>
      </div>
    </div>
  );
}

function TableData({ title, value, color }: { title: string; value: string;color: string }) {
  return (
    <Box contentClass={`p-4 flex flex-col items-center gap-4 ${color}`}>
      <p className="text-mc-2 mx-3">{title}</p>
      <p className="text-mc-4 mx-5">{value}</p>
    </Box>
  );
}

