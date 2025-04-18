/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Background } from "~/components/ui/background";
import { Box } from "~/components/ui/box";
import { Search } from "./search";
import { Skin } from "~/components/ui/skin";

export default function NotFound() {
  // TODO: take the wrong ign from the url here v
  const misspelled_ign = "URL-WRONG-NAME";

  return (
    <div className="relative grow">
      <Background
        background="general"
        className="h-full"
        mask="linear-gradient(rgb(255 255 255) 20%, rgb(0 0 0 / 0) 95%)"
      />
      <div className="absolute w-full h-full bg-red-700 mix-blend-color  -z-10" />
      <div className="absolute w-full h-full bg-black/80 -z-10" />
      <div
        className="absolute w-full h-full -z-10"
        style={{ background: "linear-gradient(rgb(17 17 17 /0) 20%, rgb(17 17 17 /1) 95%)" }}
      />
      <div className="w-full h-full min-h-150 flex flex-col items-center justify-between z-10">
        <div className="flex grow flex-col items-center justify-center gap-4">
          <Box>
            <span className="text-mc-dark-red">[</span>
            <span className="text-mc-red">???</span>
            <span className="text-mc-dark-red">]</span> {misspelled_ign}
          </Box>
          <Skin uuid="76a56ac7fcf649fca0531cb5c77cd9ae" className="h-64" />
          <h1 className="text-mc-4 lg:text-mc-7 text-mc-red font-bold">Player Not Found</h1>
          <p className="max-w-64 lg:max-w-none text-mc-1.5 lg:text-mc-2 text-mc-gray text-center">
            This player does not exist. Make sure you spelled the name correctly
          </p>
        </div>
        <div className="mb-8 w-[50%]">
          <Search />
        </div>
      </div>
    </div>
  );
}
