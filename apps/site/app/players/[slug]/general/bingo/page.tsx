/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Bingo } from "./bingo";
import { getPlayer } from "~/app/api";
import { notFound } from "next/navigation";

export default async function BingoPage({ params }: PageProps<"/players/[slug]/general/bingo">) {
  const { slug } = await params;
  
  const player = await getPlayer(slug);
  if (!player) notFound();

  return <Bingo player={player} />;
}
