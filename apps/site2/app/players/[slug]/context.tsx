/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

"use client";

import { type ReactNode, createContext, use } from "react";
import type { Player } from "@statsify/schemas";

const PlayerContext = createContext<{ player: Player | undefined }>({
  player: undefined,
});

export const PlayerProvider = ({ player, children }: {
  player: Player;
  children: ReactNode;
}) => (
  <PlayerContext value={{ player }}>
    {children}
  </PlayerContext>
);

export function usePlayer() {
  const { player } = use(PlayerContext);

  if (!player) {
    throw new Error("Either usePlayer isn't being used in a PlayerContext or the player doesn't exist");
  }

  return player;
}

