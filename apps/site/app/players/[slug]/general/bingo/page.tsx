/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { notFound } from "next/navigation";
import { z } from "zod";
import { getPlayer } from "~/app/api";
import { Bingo } from "./bingo";
import BingoSkeleton from "./loading";

const PlayerParams = z.object({
  slug: z.string(),
});

export default async function BingoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = PlayerParams.parse(await params);
  const player = await getPlayer(slug);
  if (!player) notFound();

  // return <BingoSkeleton />;
  return <Bingo player={player} />;
}
