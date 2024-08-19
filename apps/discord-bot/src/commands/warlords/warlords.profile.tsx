/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Container, Footer, Header, type SidebarItem } from "#components";
import { FormattedGame, type GameMode, WarlordsMage, WarlordsModes, WarlordsPaladin, WarlordsShaman, WarlordsWarrior } from "@statsify/schemas";
import { WarlordsCaptureTheFlagTable, WarlordsClassTable, WarlordsDeathmatchTable, WarlordsDominationTable, WarlordsOverallTable } from "./tables/index.js";
import { prettify } from "@statsify/util";
import type { BaseProfileProps } from "#commands/base.hypixel-command";

export interface WarlordsProfileProps extends BaseProfileProps {
  mode: GameMode<WarlordsModes>;
}

export const WarlordsProfile = ({
  player,
  background,
  logo,
  skin,
  t,
  badge,
  user,
  mode,
  time,
}: WarlordsProfileProps) => {
  const { warlords } = player.stats;

  const sidebar: SidebarItem[] = [
    [t("stats.coins"), t(warlords.coins), "§6"],
  ];

  if (mode.api !== "overall" && mode.api !== "captureTheFlag" && mode.api !== "domination" && mode.api !== "teamDeathmatch") {
    sidebar.push(
      [t("stats.spec"), prettify(warlords[mode.api].specification), "§a"],
      [t("stats.level"), t(warlords[mode.api].level), "§a"]
    );
  } else {
    sidebar.push([t("stats.class"), prettify(warlords.class), "§e"]);
    const clazz = warlords.class as "mage" | "warrior" | "paladin" | "shaman";
    // Verify that the cast is correct and the class is a valid class
    if (clazz in warlords && typeof warlords[clazz] === "object") sidebar.push([t("stats.spec"), prettify(warlords[clazz].specification), "§a"]);
  }

  let table: JSX.Element;

  switch (mode.api) {
    case "overall":
      table = <WarlordsOverallTable warlords={warlords} t={t} />;
      break;

    case "captureTheFlag":
      table = <WarlordsCaptureTheFlagTable warlords={warlords} t={t} />;
      break;

    case "domination":
      table = <WarlordsDominationTable warlords={warlords} t={t} />;
      break;

    case "teamDeathmatch":
      table = <WarlordsDeathmatchTable warlords={warlords} t={t} />;
      break;

    case "mage":
      table = <WarlordsClassTable stats={warlords.mage} constructor={WarlordsMage} color="§b" t={t} />;
      break;

    case "warrior":
      table = <WarlordsClassTable stats={warlords.warrior} constructor={WarlordsWarrior} color="§7" t={t} />;
      break;

    case "paladin":
      table = <WarlordsClassTable stats={warlords.paladin} constructor={WarlordsPaladin} color="§e" t={t} />;
      break;

    case "shaman":
      table = <WarlordsClassTable stats={warlords.shaman} constructor={WarlordsShaman} color="§2" t={t} />;
      break;
  }

  return (
    <Container background={background}>
      <Header
        skin={skin}
        name={player.prefixName}
        badge={badge}
        sidebar={sidebar}
        title={`§l${FormattedGame.WARLORDS} §fStats §r(${mode.formatted})`}
        time={time}
      />
      {table}
      <Footer logo={logo} user={user} />
    </Container>
  );
};
