/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Container, Footer, Header, type SidebarItem, Table } from "#components";
import { LevelBar } from "./components/LevelBar.js";
import { POWDERS, type Powder } from "@statsify/skyblock";
import { prettify } from "@statsify/util";
import type { SkyBlockProfileProps } from "./skyblock.command.js";

const POWDER_COLORS: Record<Powder, string> = {
  mithril: "§2",
  gemstone: "§d",
  glacite: "§b",
};

export const SkyBlockHotmProfile = ({
  profile,
  title,
  skin,
  badge,
  background,
  logo,
  user,
  t,
}: SkyBlockProfileProps) => {
  const { level, loadout, tokens, ability, powder } = profile.member.hotm!;

  const sidebar: SidebarItem[] = [
    [t("skyblock.tokensSpent"), `${t(tokens.spent)}§7/§5${t(tokens.total)}`, "§5"],
    [t("skyblock.pickaxeAbility"), ability ? prettify(ability) : t("skyblock.none"), "§e"],
  ];

  if (loadout.total > 1) sidebar.unshift([t("skyblock.loadout"), t("skyblock.loadoutOf", loadout), "§b"]);

  const powders = POWDERS.map((type) => {
    const color = POWDER_COLORS[type];
    const { total, spent } = powder[type];

    return (
      <box direction="column" location="center" width="100%">
        <text margin={{ top: 8, bottom: 4, left: 6, right: 6 }}>{`${color}${t(`skyblock.powders.${type}`)}`}</text>
        <text margin={{ top: 0, bottom: 4, left: 10, right: 10 }}>{`§^3^${color}${t(total)}`}</text>
        <text margin={{ top: 0, bottom: 8, left: 10, right: 10 }}>{`§7${t("skyblock.spent")}: ${color}${t(spent)}`}</text>
      </box>
    );
  });

  return (
    <Container background={background}>
      <Header skin={skin} name={profile.displayName} badge={badge} sidebar={sidebar} title={title} time="LIVE" />
      <Table.table>
        <Table.tr>
          <LevelBar title={t("skyblock.hotmLevel")} level={level} color="§5" t={t} />
        </Table.tr>
        <Table.tr>{powders}</Table.tr>
      </Table.table>
      <Footer logo={logo} user={user} />
    </Container>
  );
};
