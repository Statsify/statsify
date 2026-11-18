/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Container, Footer, Header, type SidebarItem, Table } from "#components";
import { Empty } from "./components/Empty.js";
import { LevelBar } from "./components/LevelBar.js";
import { PerkCurrency, PerkTree } from "./components/PerkTree.js";
import { WHISPERS, WHISPER_COLORS } from "@statsify/skyblock/display";
import { prettify } from "@statsify/util";
import type { SkyBlockProfileProps } from "./skyblock.command.js";

export const SkyBlockHotfProfile = ({
  profile,
  title,
  skin,
  badge,
  background,
  logo,
  user,
  t,
}: SkyBlockProfileProps) => {
  const hotf = profile.member.hotf;

  if (!hotf) {
    return (
      <Container background={background}>
        <Header skin={skin} name={profile.displayName} badge={badge} title={title} time="LIVE" />
        <Empty text={t("skyblock.noHotf")} />
        <Footer logo={logo} user={user} />
      </Container>
    );
  }

  const { level, centerLevel, loadout, tokens, ability, whispers, nodes } = hotf;

  const sidebar: SidebarItem[] = [
    [t("skyblock.tokensSpent"), `${t(tokens.spent)}§7/§a${t(tokens.total)}`, "§a"],
    [t("skyblock.centerOfTheForest"), t(centerLevel), "§6"],
    [t("skyblock.ability"), ability ? prettify(ability) : t("skyblock.none"), "§e"],
  ];

  if (loadout.total > 1) sidebar.unshift([t("skyblock.loadout"), t("skyblock.loadoutOf", loadout), "§b"]);

  const pools = WHISPERS.map((type) => (
    <PerkCurrency
      name={t(`skyblock.whispers.${type}`)}
      color={WHISPER_COLORS[type]}
      earned={whispers[type].total}
      spent={whispers[type].spent}
      t={t}
    />
  ));

  return (
    <Container background={background}>
      <Header skin={skin} name={profile.displayName} badge={badge} sidebar={sidebar} title={title} time="LIVE" />
      <Table.table>
        <Table.tr>
          <LevelBar title={t("skyblock.hotfLevel")} level={level} color="§a" t={t} />
        </Table.tr>
        {/* Not a Table.tr: its cells keep their own height, and the tree's box should be as tall as the whispers */}
        <div width="100%">
          <div direction="column" width="1/2">
            {pools}
          </div>
          <box direction="column" width="1/2" height="remaining" location="center">
            <text margin={{ top: 8, bottom: 4, left: 6, right: 6 }}>{`§a${t("skyblock.perkTree")}`}</text>
            <PerkTree nodes={nodes} />
          </box>
        </div>
      </Table.table>
      <Footer logo={logo} user={user} />
    </Container>
  );
};
