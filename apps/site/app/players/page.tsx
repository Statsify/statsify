/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import Link from "next/link";
import { Background } from "~/components/ui/background";
import { Brand } from "~/components/icons/logo";
import { Search } from "./search";

export default function PlayerSearchPage() {
  return (
    <div className="relative grow">
      <Background
        background="bingo"
        className="h-full"
        mask="linear-gradient(rgb(255 255 255) 20%, rgb(0 0 0 / 0) 95%)"
      />
      <div className="absolute h-full w-full bg-[rgb(17_17_17_/0.7)] -z-10" />
      <div className="w-full h-full flex justify-center items-center flex-col gap-8">
        <Link href="/" className="absolute top-0 mt-3 scale-[0.75]">
          <Brand />
        </Link>
        <div className="flex flex-col gap-3 items-center mt-12 mb-4 lg:mb-8">
          <h1 className="text-mc-yellow text-mc-4 lg:text-mc-7 font-bold"><span className="text-[#FFFF55]">B</span><span className="text-[#FFF349]">i</span><span className="text-[#FFE73D]">n</span><span className="text-[#FFDB31]">g</span><span className="text-[#FFCE24]">o</span><span className="text-[#FFC218]">i</span><span className="text-[#FFB60C]">f</span><span className="text-[#FFAA00]">y</span></h1>
          <h2 className="text-mc-gold text-mc-2 lg:text-mc-3">12th Anniversary Bingo</h2>
        </div>
        <div className="w-[80%]">
          <Search />
        </div>
      </div>
    </div>
  );
}
