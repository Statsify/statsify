/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { PlayerProvider } from "./context";
import { getPlayer } from "~/app/api";
import { notFound } from "next/navigation";
import { z } from "zod";
import type { ReactNode } from "react";

const PlayerParams = z.object({
  slug: z.string(),
});

export default async function PlayerLayout({
  params,
  children,
}: { params: Promise<{ slug: string }>; children: ReactNode }) {
  const { slug } = PlayerParams.parse(await params);
  const player = await getPlayer(slug);
  if (!player) notFound();

  return (
    <PlayerProvider player={player}>
      {children}
    </PlayerProvider>
  );
}
