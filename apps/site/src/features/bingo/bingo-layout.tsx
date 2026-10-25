/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { PageBackground } from "~/components/ui/background";
import { Divider } from "~/components/ui/divider";
import { Search } from "~/components/search";
import { useTranslation } from "react-i18next";
import type { ReactNode } from "react";

export function BingoHeading() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-2 items-center mb-4 lg:mb-8">
      <h1 className="text-mc-yellow text-mc-4 lg:text-mc-7 font-bold">
        <span className="text-[#FFFF55]">B</span>
        <span className="text-[#FFF349]">i</span>
        <span className="text-[#FFE73D]">n</span>
        <span className="text-[#FFDB31]">g</span>
        <span className="text-[#FFCE24]">o</span>
        <span className="text-[#FFC218]">i</span>
        <span className="text-[#FFB60C]">f</span>
        <span className="text-[#FFAA00]">y</span>
      </h1>
      <h2 className="text-center text-mc-gold text-mc-2 lg:text-mc-3">{t("bingo.subtitle")}</h2>
    </div>
  );
}

/** The board pages: Bingoify heading, the search box pre-filled with the player, then the boards. */
export function BingoLayout({ name, children }: { name: string; children: ReactNode }) {
  return (
    <div className="grow">
      <div className="relative h-full mb-8">
        <PageBackground
          background="bingo"
          viewport
          className="h-full aspect-auto"
          mask="linear-gradient(rgb(255 255 255) 50%, rgb(0 0 0 / 0) calc(100% - 32px))"
        />
        <div className="w-full max-w-[1800px] mx-auto flex justify-center items-center flex-col gap-4 px-4 pt-8 md:px-8">
          <BingoHeading />
          <div className="w-full lg:w-[80%] flex items-stretch flex-col gap-4">
            <Search key={name} defaultValue={name} target="bingo" shortcut />
            <Divider variant="black" className="my-2" />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
