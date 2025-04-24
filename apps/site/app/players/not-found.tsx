/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

"use client";

import { Box } from "~/components/ui/box";
import { Error } from "~/components/ui/error";
import { Search } from "./search";
import { Skin } from "~/components/ui/skin";
import { useParams } from "next/navigation";

export default function NotFound() {
  const { slug } = useParams<{ slug: string }>();

  return (
    <Error className="gap-8 flex-col-reverse md:flex-col px-8">
      <Search className="w-full" defaultValue={slug} />
      <div className="flex flex-col items-center justify-center gap-4">
        <Box>
          <span className="text-mc-dark-red">[</span>
          <span className="text-mc-red">???</span>
          <span className="text-mc-dark-red">]</span> {slug}
        </Box>
        <Skin uuid="76a56ac7fcf649fca0531cb5c77cd9ae" className="h-64" />
        <h1 className="text-mc-4 lg:text-mc-7 text-mc-red font-bold">Player Not Found</h1>
        <p className="text-mc-1.5 lg:text-mc-2 text-mc-gray text-center">
          This player does not exist. Make sure you spelled the name correctly
        </p>
      </div>
    </Error>
  );
}
