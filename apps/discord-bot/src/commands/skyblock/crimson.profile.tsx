/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Container, Footer, Header, type SidebarItem, Table } from "#components";
import { Empty } from "./components/Empty.js";
import { ItemSlot } from "./components/ItemSlot.js";
import { DOJO_BELT_COLORS, DOJO_GRADE_COLORS, FACTION_COLORS } from "@statsify/skyblock/display";
import { arrayGroup, formatTime, prettify } from "@statsify/util";
import type { Faction, MemberView } from "@statsify/skyblock";
import type { SkyBlockProfileProps } from "./skyblock.command.js";

export const crimsonIcons = ({ crimson }: MemberView) => crimson?.kuudra.map(({ texture }) => texture) ?? [];

export const SkyBlockCrimsonProfile = ({
  profile,
  title,
  skin,
  badge,
  background,
  logo,
  user,
  t,
  icons,
}: SkyBlockProfileProps) => {
  const crimson = profile.member.crimson;

  if (!crimson) {
    return (
      <Container background={background}>
        <Header skin={skin} name={profile.displayName} badge={badge} title={title} time="LIVE" />
        <Empty text={t("skyblock.noCrimson")} />
        <Footer logo={logo} user={user} />
      </Container>
    );
  }

  const { faction, reputation, reputationRanks } = crimson;
  const withRank = (side: Faction) => `${t(reputation[side])} §7${t(`skyblock.reputationRanks.${reputationRanks[side]}`)}`;

  const sidebar: SidebarItem[] = [
    [t("skyblock.faction"), faction ? `${FACTION_COLORS[faction]}${prettify(faction)}` : t("skyblock.none"), "§e"],
    [t("skyblock.reputation.mages"), withRank("mages"), FACTION_COLORS.mages],
    [t("skyblock.reputation.barbarians"), withRank("barbarians"), FACTION_COLORS.barbarians],
    [t("skyblock.dojoPoints"), t(crimson.dojoPoints), "§6"],
    [t("skyblock.dojoBelt"), prettify(crimson.dojoBelt), DOJO_BELT_COLORS[crimson.dojoBelt]],
  ];

  const kuudra = crimson.kuudra.map(({ tier, completions, highestWave, texture }) => (
    <box direction="column" location="center" width="100%">
      <ItemSlot icon={icons.get(texture)} />
      <text margin={{ top: 4, bottom: 4 }}>{`§c${t(`skyblock.kuudraTiers.${tier}`)}`}</text>
      <text margin={{ top: 0, bottom: 4 }}>{`§^3^§f${t(completions)}`}</text>
      <text margin={{ top: 0, bottom: 4 }}>
        {highestWave === undefined ? `§8${t("skyblock.none")}` : `§7${t("skyblock.highestWave", { wave: t(highestWave) })}`}
      </text>
    </box>
  ));

  const dojo = crimson.dojo.map(({ test, points, grade, time }) => (
    <box direction="column" location="center" width="100%">
      <text margin={{ top: 8, bottom: 4, left: 6, right: 6 }}>{`§6${t(`skyblock.dojoTests.${test}`)}`}</text>
      <text margin={{ top: 0, bottom: 4 }}>{`§f${t(points)} ${DOJO_GRADE_COLORS[grade]}${grade}`}</text>
      <text margin={{ top: 0, bottom: 8 }}>{`§7${time === undefined ? t("skyblock.none") : formatTime(time)}`}</text>
    </box>
  ));

  return (
    <Container background={background}>
      <Header skin={skin} name={profile.displayName} badge={badge} sidebar={sidebar} title={title} time="LIVE" />
      <Table.table>
        <Table.ts title={`§c${t("skyblock.kuudra")}`}>
          <Table.tr>{kuudra}</Table.tr>
        </Table.ts>
        <Table.ts title={`§6${t("skyblock.dojo")}`}>
          <Table.tr>{dojo}</Table.tr>
        </Table.ts>
        {/* Five minibosses in one row set the card's width, so they wrap three and two */}
        <Table.ts title={`§e${t("skyblock.minibosses")}`}>
          {arrayGroup(crimson.minibosses, 3).map((row) => (
            <Table.tr>
              {row.map(({ boss, kills }) => (
                <Table.td title={prettify(boss)} value={t(kills)} color="§e" size="small" />
              ))}
            </Table.tr>
          ))}
        </Table.ts>
      </Table.table>
      <Footer logo={logo} user={user} />
    </Container>
  );
};
