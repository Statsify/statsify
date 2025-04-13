/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Background } from "~/components/ui/background";
import { LogoError } from "~/components/icons/logo-error";

export default function NotFound() {
  return (
    <div className="relative">
      <div className="relative h-[100dvh]">
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
        <LogoError className="size-64 lg:size-128" />
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-mc-7 lg:text-mc-13 font-bold">
            <span className="text-[#FFD0D7]">O</span>
            <span className="text-[#F42A37]">O</span>
            <span className="text-[#CD1820]">P</span>
            <span className="text-[#B11117]">S</span>
            <span className="text-[#A10B10]">!</span>
          </h1>
          <p className="max-w-64 lg:max-w-none text-mc-1.5 lg:text-mc-2 text-mc-gray text-center">
            Looks like the page you're trying to reach does not exist
          </p>
        </div>
      </div>
    </div>
  );
}
