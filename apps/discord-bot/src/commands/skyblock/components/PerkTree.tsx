/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Color } from "@statsify/schemas";
import type { LocalizeFunction } from "@statsify/discord";
import type { TreeNode } from "@statsify/skyblock";

const TREE_WIDTH = 7;
const PERK_SIZE = 14;

function getPerkColor({ level, maxLevel, enabled }: TreeNode) {
  if (level === 0) return new Color("§8").hex;
  if (!enabled) return new Color("§c").hex;
  return new Color(level === maxLevel ? "§a" : "§e").hex;
}

export const PerkTree = ({ nodes }: { nodes: TreeNode[] }) => {
  const nodesByPosition = new Map(
    nodes.map((node) => [`${node.x},${node.y}`, node]),
  );
  const height = Math.max(...nodes.map(({ y }) => y)) + 1;

  return (
    <div
      direction="column"
      align="center"
      margin={{ top: 8, bottom: 8, left: 6, right: 6 }}
    >
      {Array.from({ length: height }, (_, y) => (
        <div>
          {Array.from({ length: TREE_WIDTH }, (_, x) => {
            const node = nodesByPosition.get(`${x},${y}`);
            if (!node) {
              return <div width={PERK_SIZE} height={PERK_SIZE} margin={1} />;
            }

            return (
              <box
                width={PERK_SIZE}
                height={PERK_SIZE}
                color={getPerkColor(node)}
                padding={0}
                margin={1}
                border={{
                  topLeft: 0,
                  topRight: 0,
                  bottomLeft: 0,
                  bottomRight: 0,
                }}
                shadowDistance={0}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
};

interface PerkCurrencyProps {
  name: string;
  color: string;
  earned: number;
  spent: number;
  t: LocalizeFunction;
}

export const PerkCurrency = ({
  name,
  color,
  earned,
  spent,
  t,
}: PerkCurrencyProps) => (
  <box direction="column" location="center" width="100%">
    <text
      margin={{ top: 8, bottom: 4, left: 6, right: 6 }}
    >{`${color}${name}`}</text>
    <text
      margin={{ top: 0, bottom: 2, left: 10, right: 10 }}
    >{`§7${t("skyblock.earned")}: ${color}${t(earned)}`}</text>
    <text
      margin={{ top: 0, bottom: 8, left: 10, right: 10 }}
    >{`§7${t("skyblock.spent")}: ${color}${t(spent)}`}</text>
  </box>
);
