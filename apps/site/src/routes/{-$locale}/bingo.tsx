/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Background } from "~/components/ui/background";
import { BingoHeading } from "~/features/bingo/bingo-layout";
import { Search } from "~/components/search";
import { cacheHeaders } from "~/lib/cache";
import { createFileRoute } from "@tanstack/react-router";
import { searchPageMeta } from "~/lib/social-meta";

export const Route = createFileRoute("/{-$locale}/bingo")({
  head: ({ matches }) => ({ meta: searchPageMeta(matches, { key: "bingo", nav: "bingo", path: "/bingo", image: "/images/og-bingo.png" }) }),
  headers: () => cacheHeaders("max-age=600, stale-while-revalidate=86400"),
  component: BingoSearchPage,
});

function BingoSearchPage() {
  return (
    <div className="relative grow">
      <Background
        background="bingo"
        priority
        viewport
        className="h-full"
        mask="linear-gradient(rgb(255 255 255) 20%, rgb(0 0 0 / 0) 95%)"
      />
      <div className="absolute h-full w-full bg-[rgb(17_17_17_/0.7)] -z-10" />
      <div className="w-full h-full flex justify-center items-center flex-col gap-8 py-12">
        <BingoHeading />
        <div className="w-full px-4 md:px-8 lg:w-[80%]">
          <Search target="bingo" shortcut />
        </div>
      </div>
    </div>
  );
}
