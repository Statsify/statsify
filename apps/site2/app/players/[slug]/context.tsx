/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

"use client";

import { ReactNode, createContext, use } from "react";
import type { Player } from "@statsify/schemas";

const PlayerContext = createContext<{ player: Player | undefined }>({ player: undefined });

export function usePlayer() {
  const { player } = use(PlayerContext);
  if (!player) throw new Error("`usePlayer` must be used within a loaded `PlayerProvider`");
  return player;
}

export function PlayerProvider({ player, children }: { player: Player; children: ReactNode }) {
  return <PlayerContext.Provider value={{ player }}>{children}</PlayerContext.Provider>;
}
