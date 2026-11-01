/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { minecraftColors } from "@statsify/util";
import type { LocalizeFunction } from "@statsify/discord";
import type { TreeNode } from "@statsify/skyblock";

const fill = (code: string) => minecraftColors.find((color) => color.code === code)!.hex;

// Both hearts' trees as their menus lay them out: 7 columns, the top tier first
const TREE_WIDTH = 7;
const PERK_SIZE = 14;

const perkColor = ({ level, maxLevel, enabled }: TreeNode) => {
  if (level === 0) return fill("§8");
  if (!enabled) return fill("§c");
  return fill(level === maxLevel ? "§a" : "§e");
};

export const PerkTree = ({ nodes }: { nodes: TreeNode[] }) => {
  const byPosition = new Map(nodes.map((node) => [`${node.x},${node.y}`, node]));
  const height = Math.max(...nodes.map(({ y }) => y)) + 1;

  return (
    <div direction="column" margin={{ top: 8, bottom: 8, left: 6, right: 6 }}>
      {Array.from({ length: height }, (_, y) => (
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

interface PerkCurrencyProps {
  name: string;
  color: string;
  amount?: number;
  spent: number;
  t: LocalizeFunction;
}

/** A powder or whisper: the amount, when it's known, then what the shown loadout spent. */
export const PerkCurrency = ({ name, color, amount, spent, t }: PerkCurrencyProps) => (
  <box direction="column" location="center" width="100%">
    <text margin={{ top: 8, bottom: 4, left: 6, right: 6 }}>{`${color}${name}`}</text>
    {amount === undefined ? <></> : <text margin={{ top: 0, bottom: 4, left: 10, right: 10 }}>{`§^3^${color}${t(amount)}`}</text>}
    <text margin={{ top: 0, bottom: 8, left: 10, right: 10 }}>{`§7${t("skyblock.spent")}: ${color}${t(spent)}`}</text>
  </box>
);
