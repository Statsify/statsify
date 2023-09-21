/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Container, Footer, Header } from "#components";
import { DropperMapsTable, DropperTable } from "./modes/index.js";
import { DropperModes, FormattedGame, GameMode } from "@statsify/schemas";
import type { BaseProfileProps } from "#commands/base.hypixel-command";

export interface DropperProfileProps extends BaseProfileProps {
  mode: GameMode<DropperModes>;
}

export const DropperProfile = ({
  skin,
  player,
  background,
  logo,
  user,
  badge,
  mode,
  t,
  time,
}: DropperProfileProps) => {
  const { arcade } = player.stats;

  let table;

  switch (mode.api) {
    case "overall":
      table = <DropperTable stats={arcade.dropper} t={t} time={time} />;
      break;
    case "bestTimes":
      table = <DropperMapsTable dropper={arcade.dropper} t={t} stat="bestTime" />;
      break;
    case "completions":
      table = <DropperMapsTable dropper={arcade.dropper} t={t} stat="completions" />;
      break;
  }

  return (
    <Container background={background}>
      <Header
        skin={skin}
        name={player.prefixName}
        badge={badge}
        title={`§l${FormattedGame.DROPPER} §fStats §r(${mode.formatted})`}
        time={time}
      />
      {table}
      <Footer logo={logo} user={user} />
    </Container>
  );
};
