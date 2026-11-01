/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Container, Footer, Header, type SidebarItem, Table } from "#components";
import { LevelBar } from "./components/LevelBar.js";
import { minecraftColors, prettify } from "@statsify/util";
import { type HotmSection, type Powder, POWDERS } from "@statsify/skyblock";
import type { SkyBlockProfileProps } from "./skyblock.command.js";

const POWDER_COLORS: Record<Powder, string> = {
  mithril: "§2",
  gemstone: "§d",
  glacite: "§b",
};

const fill = (code: string) => minecraftColors.find((color) => color.code === code)!.hex;

// The perk tree as the menu lays it out: 7 columns, the top tier first
const TREE_WIDTH = 7;
const TREE_HEIGHT = 10;
const PERK_SIZE = 14;

const perkColor = ({ level, maxLevel, enabled }: HotmSection["nodes"][number]) => {
  if (level === 0) return fill("§8");
  if (!enabled) return fill("§c");
  return fill(level === maxLevel ? "§a" : "§e");
};

const PerkTree = ({ nodes }: { nodes: HotmSection["nodes"] }) => {
  const byPosition = new Map(nodes.map((node) => [`${node.x},${node.y}`, node]));

  return (
    <div direction="column" margin={{ top: 8, bottom: 8, left: 6, right: 6 }}>
      {Array.from({ length: TREE_HEIGHT }, (_, y) => (
        <div>
          {Array.from({ length: TREE_WIDTH }, (_, x) => {
            const node = byPosition.get(`${x},${y}`);
            return node ?
              (
                <box
                  width={PERK_SIZE}
                  height={PERK_SIZE}
                  color={perkColor(node)}
                  padding={0}
                  margin={1}
                  border={{ topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0 }}
                  shadowDistance={0}
                />
              ) :
              <div width={PERK_SIZE} height={PERK_SIZE} margin={1} />;
          })}
        </div>
      ))}
    </div>
  );
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
  const { level, coreLevel, loadout, tokens, ability, powder, nodes, crystals, nucleusRuns, glacite } =
    profile.member.hotm!;

  const sidebar: SidebarItem[] = [
    [t("skyblock.tokensSpent"), `${t(tokens.spent)}§7/§5${t(tokens.total)}`, "§5"],
    [t("skyblock.coreOfTheMountain"), t(coreLevel), "§6"],
    [t("skyblock.pickaxeAbility"), ability ? prettify(ability) : t("skyblock.none"), "§e"],
  ];

  if (loadout.total > 1) sidebar.unshift([t("skyblock.loadout"), t("skyblock.loadoutOf", loadout), "§b"]);

  const powders = POWDERS.map((type) => {
    const color = POWDER_COLORS[type];
    const { available, spent } = powder[type];

    return (
      <box direction="column" location="center" width="100%">
        <text margin={{ top: 8, bottom: 4, left: 6, right: 6 }}>{`${color}${t(`skyblock.powders.${type}`)}`}</text>
        <text margin={{ top: 0, bottom: 4, left: 10, right: 10 }}>{`§^3^${color}${t(available)}`}</text>
        <text margin={{ top: 0, bottom: 8, left: 10, right: 10 }}>{`§7${t("skyblock.spent")}: ${color}${t(spent)}`}</text>
      </box>
    );
  });

  const stats: [string, number, string][] = [
    [t("skyblock.crystalsFound"), crystals.found, "§d"],
    [t("skyblock.crystalsPlaced"), crystals.placed, "§d"],
    [t("skyblock.nucleusRuns"), nucleusRuns, "§5"],
    [t("skyblock.corpsesLooted"), glacite.corpses, "§b"],
    [t("skyblock.fossilsDonated"), glacite.fossils, "§6"],
    [t("skyblock.mineshafts"), glacite.mineshafts, "§3"],
  ];

  return (
    <Container background={background}>
      <Header skin={skin} name={profile.displayName} badge={badge} sidebar={sidebar} title={title} time="LIVE" />
      <Table.table>
        <Table.tr>
          <LevelBar title={t("skyblock.hotmLevel")} level={level} color="§5" t={t} />
        </Table.tr>
        <Table.tr>{powders}</Table.tr>
        <Table.tr>
          <box width="100%" location="center">
            <PerkTree nodes={nodes} />
          </box>
          <box direction="column" location="center" width="100%">
            {stats.map(([name, value, color]) => (
              <text margin={{ top: 2, bottom: 2, left: 10, right: 10 }}>{`§7${name}: ${color}${t(value)}`}</text>
            ))}
          </box>
        </Table.tr>
      </Table.table>
      <Footer logo={logo} user={user} />
    </Container>
  );
};
