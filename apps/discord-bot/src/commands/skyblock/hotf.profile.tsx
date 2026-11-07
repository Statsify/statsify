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

  const { level, centerLevel, loadout, tokensSpent, ability, whispers, nodes } = hotf;

  const sidebar: SidebarItem[] = [
    [t("skyblock.tokensSpent"), t(tokensSpent), "§a"],
    [t("skyblock.centerOfTheForest"), t(centerLevel), "§6"],
    [t("skyblock.ability"), ability ? prettify(ability) : t("skyblock.none"), "§e"],
  ];

  if (loadout.total > 1) sidebar.unshift([t("skyblock.loadout"), t("skyblock.loadoutOf", loadout), "§b"]);

  const pools = WHISPERS.map((type) => (
    <PerkCurrency
      name={t(`skyblock.whispers.${type}`)}
      color={WHISPER_COLORS[type]}
      amount={whispers[type].total}
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
        <Table.tr>
          <div direction="column" width="100%">
            {pools}
          </div>
          <box width="100%" location="center">
            <PerkTree nodes={nodes} />
          </box>
        </Table.tr>
      </Table.table>
      <Footer logo={logo} user={user} />
    </Container>
  );
};
