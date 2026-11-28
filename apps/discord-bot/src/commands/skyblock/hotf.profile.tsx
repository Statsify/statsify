/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Card, EmptyCard } from "./components/Card.js";
import { type SidebarItem, Table } from "#components";
import { LevelBar } from "./components/LevelBar.js";
import { PerkCurrency, PerkTree } from "./components/PerkTree.js";
import { WHISPERS, type Whisper } from "@statsify/skyblock";
import { prettify } from "@statsify/util";
import type { SkyBlockProfileProps } from "./skyblock.command.js";

const WHISPER_COLORS: Record<Whisper, string> = {
  forest: "§a",
  desert: "§e",
};

export const SkyBlockHotfProfile = ({
  profile,
  t,
  ...card
}: SkyBlockProfileProps) => {
  const hotf = profile.member.hotf;

  if (!hotf) {
    return (
      <EmptyCard
        {...card}
        name={profile.displayName}
        text={t("skyblock.noHotf")}
      />
    );
  }

  const { level, centerLevel, loadout, tokens, ability, whispers, nodes } =
    hotf;

  const sidebar: SidebarItem[] = [
    [t("skyblock.tokensSpent"), t(tokens.spent), "§a"],
    [t("skyblock.centerOfTheForest"), t(centerLevel), "§6"],
    [
      t("skyblock.ability"),
      ability ? prettify(ability) : t("skyblock.none"),
      "§e",
    ],
  ];

  if (loadout.total > 1)
    sidebar.unshift([
      t("skyblock.loadout"),
      t("skyblock.loadoutOf", loadout),
      "§b",
    ]);

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
    <Card {...card} name={profile.displayName} sidebar={sidebar}>
      <Table.table>
        <Table.tr>
          <LevelBar
            title={t("skyblock.hotfLevel")}
            level={level}
            color="§a"
            t={t}
          />
        </Table.tr>
        {/* A Table.tr won't stretch the tree's box to the whispers' height. */}
        <div width="100%">
          <div direction="column" width="1/2">
            {pools}
          </div>
          <box
            direction="column"
            width="1/2"
            height="remaining"
            location="center"
          >
            <text
              margin={{ top: 8, bottom: 4, left: 6, right: 6 }}
            >{`§a${t("skyblock.perkTree")}`}</text>
            <PerkTree nodes={nodes} />
          </box>
        </div>
      </Table.table>
    </Card>
  );
};
