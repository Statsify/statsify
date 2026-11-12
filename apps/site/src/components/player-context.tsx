/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type ReactNode, createContext, use, useMemo } from "react";

const PlayerContext = createContext<{ player: unknown }>({ player: undefined });

/** Hands a preview its player view model (`@statsify/contract`'s `*Preview` types) without prop drilling. */
export function PlayerProvider<T>({ player, children }: { player: T; children: ReactNode }) {
  const value = useMemo(() => ({ player }), [player]);
  return <PlayerContext value={value}>{children}</PlayerContext>;
}

export function usePlayer<T>(): T {
  const { player } = use(PlayerContext);

  if (player === undefined) {
    throw new Error("Either usePlayer isn't being used in a PlayerContext or the player doesn't exist");
  }

  return player as T;
}
