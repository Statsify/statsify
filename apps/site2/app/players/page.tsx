/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Background } from "~/components/ui/background";
import { Search } from "./search";

export default function PlayerSearchPage() {
  return (
    <div className="relative h-[100dvh]">
      <Background
        background="bingo"
        className="h-full"
        mask="linear-gradient(rgb(255 255 255) 20%, rgb(0 0 0 / 0) 95%)"
      />
      <div className="absolute h-[100dvh] w-full bg-[rgb(17_17_17_/0.7)] -z-10" />
      <div className="w-full h-full flex justify-center items-center flex-col gap-8">
        <div className="flex flex-col gap-2 items-center">
          <h1 className="text-mc-yellow text-mc-7 font-bold">Bingo Tracker</h1>
          <h2 className="text-mc-gold text-mc-3">12th Anniversary Bingo</h2>
        </div>
        <div className="w-[80%]">
          <Search />
        </div>
      </div>
    </div>
  );
}
