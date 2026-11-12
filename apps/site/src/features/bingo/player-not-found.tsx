/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Box } from "~/components/ui/box";
import { Error } from "~/components/ui/error";
import { Search } from "./search";
import { Skin } from "~/components/ui/skin";
import { useParams } from "@tanstack/react-router";

export function PlayerNotFound() {
  const { name = "" } = useParams({ strict: false });

  return (
    <Error className="gap-8 flex-col-reverse md:flex-col px-8">
      <Search key={name} className="w-full" defaultValue={name} />
      <div className="flex flex-col items-center justify-center gap-4">
        <Box>
          <span className="text-mc-dark-red">[</span>
          <span className="text-mc-red">???</span>
          <span className="text-mc-dark-red">]</span> {name}
        </Box>
        <Skin uuid="76a56ac7fcf649fca0531cb5c77cd9ae" className="h-64" />
        <h1 className="text-mc-4 lg:text-mc-7 text-mc-red font-bold">Player Not Found</h1>
        <p className="text-20 lg:text-24 font-medium text-mc-gray text-center">
          This player does not exist. Make sure you spelled the name correctly
        </p>
      </div>
    </Error>
  );
}
