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
import type { Metadata } from "next";

export async function generateMetadata({ params }: PageProps<"/players/[slug]/general/bingo">): Promise<Metadata> {
  const { slug } = await params;
  const player = await getPlayer(slug);

  if (!player) return {};

  const nameWithAppostrophe = `${player.username}'${player.username.endsWith("s") ? "" : "s"}`;

  return {
    title: `${nameWithAppostrophe} Bingo Stats | Statsify`,
    description: `View ${nameWithAppostrophe} Hypixel 12th Anniversary Bingo Tasks.`,
  };
}

export default async function BingoPage({ params }: PageProps<"/players/[slug]/general/bingo">) {
  const { slug } = await params;

  const player = await getPlayer(slug);
  if (!player) return notFound();

  return <Bingo player={player} />;
}
