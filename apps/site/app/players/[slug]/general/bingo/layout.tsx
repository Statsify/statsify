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
import { Divider } from "~/components/ui/divider";
import { Search } from "~/app/players/search";

export default async function BingoLayout({ children, params }: LayoutProps<"/players/[slug]/general/bingo">) {
  const { slug } = await params;

  return (
    <div className="grow">
      <div className="relative h-full mb-8">
        <Background
          background="bingo"
          className="h-full aspect-auto"
          mask="linear-gradient(rgb(255 255 255) 50%, rgb(0 0 0 / 0) calc(100% - 32px))"
        />
        <div className="absolute h-full w-full bg-[rgb(17_17_17_/0.7)] -z-10" />
        <div className="w-[95%] max-w-[1800px] mx-auto flex justify-center items-center flex-col gap-4">
          <Link href="/" className="absolute top-0 mt-3 scale-[0.75]">
            <Brand />
          </Link>
          <div className="flex flex-col gap-2 items-center mt-30 mb-4 lg:mb-8">
            <h1 className="text-mc-yellow text-mc-4 lg:text-mc-7 font-bold"><span className="text-[#FFFF55]">B</span><span className="text-[#FFF349]">i</span><span className="text-[#FFE73D]">n</span><span className="text-[#FFDB31]">g</span><span className="text-[#FFCE24]">o</span><span className="text-[#FFC218]">i</span><span className="text-[#FFB60C]">f</span><span className="text-[#FFAA00]">y</span></h1>
            <h2 className="text-mc-gold text-mc-2 lg:text-mc-3">12th Anniversary Hypixel Bingo</h2>
          </div>
          <div className="w-[80%] flex items-stretch flex-col gap-4">
            <Search defaultValue={slug} />
            <Divider variant="black" className="my-2" />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
