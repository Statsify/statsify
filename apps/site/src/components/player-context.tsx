/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type ReactNode, createContext, use, useMemo } from "react";
import type { Json } from "~/lib/json";
import type { Player } from "@statsify/schemas";

const PlayerContext = createContext<{ player: Json<Player> | undefined }>({
  player: undefined,
});

export const PlayerProvider = ({
  player,
  children,
}: {
  player: Json<Player>;
  children: ReactNode;
}) => {
  const value = useMemo(() => ({ player }), [player]);
  return <PlayerContext value={value}>{children}</PlayerContext>;
};

export function usePlayer() {
  const { player } = use(PlayerContext);

  if (!player) {
    throw new Error(
      "Either usePlayer isn't being used in a PlayerContext or the player doesn't exist",
    );
  }

  return player;
}
