/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Background } from "~/components/ui/background";
import { Box } from "~/components/ui/box";
import { Skin } from "~/components/ui/skin";

export default function NotFound() {
  return (
    <div className="relative grow">
      <div className="relative h-full">
        <Background
          background="general"
          className="h-full"
          mask="linear-gradient(rgb(255 255 255) 20%, rgb(0 0 0 / 0) 95%)"
        />
        <div className="absolute w-full h-full bg-red-700 mix-blend-color z-5" />
        <div className="absolute w-full h-full bg-black/80 z-5" />
        <div
          className="absolute w-full h-full z-5"
          style={{ background: "linear-gradient(rgb(17 17 17 /0) 20%, rgb(17 17 17 /1) 95%)" }}
        />
      </div>
      <div className="absolute top-0 w-full h-full flex flex-col items-center justify-center z-10">
        <div className="flex flex-col items-center gap-4">
          <Box>
            <span className="text-mc-dark-red">[</span>
            <span className="text-mc-red">???</span>
            <span className="text-mc-dark-red">]</span> Non-Existent
          </Box>
          <Skin uuid="76a56ac7fcf649fca0531cb5c77cd9ae" contentClass="h-64" />
          <h1 className="text-mc-6 lg:text-mc-12 text-mc-red font-bold">WHO?</h1>
          <p className="max-w-64 lg:max-w-none text-mc-1.5 lg:text-mc-2 text-mc-gray text-center">
            This player does not exist. Make sure you spelled the name correctly
          </p>
        </div>
      </div>
    </div>
  );
}
