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
import { FACTION_COLORS } from "@statsify/skyblock/display";
import { prettify } from "@statsify/util";
import type { MemberView } from "@statsify/skyblock";
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

  const { faction, reputation } = crimson;

  const sidebar: SidebarItem[] = [
    [t("skyblock.faction"), faction ? `${FACTION_COLORS[faction]}${prettify(faction)}` : t("skyblock.none"), "§e"],
    [t("skyblock.reputation.mages"), t(reputation.mages), FACTION_COLORS.mages],
    [t("skyblock.reputation.barbarians"), t(reputation.barbarians), FACTION_COLORS.barbarians],
    [t("skyblock.dojoPoints"), t(crimson.dojoPoints), "§6"],
  ];

  const kuudra = crimson.kuudra.map(({ tier, completions, texture }) => (
    <box direction="column" location="center" width="100%">
      <ItemSlot icon={icons.get(texture)} />
      <text margin={{ top: 4, bottom: 4 }}>{`§c${t(`skyblock.kuudraTiers.${tier}`)}`}</text>
      <text margin={{ top: 0, bottom: 4 }}>{`§^3^§f${t(completions)}`}</text>
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
          <Table.tr>
            {crimson.dojo.map(({ test, points }) => (
              <Table.td title={t(`skyblock.dojoTests.${test}`)} value={t(points)} color="§6" size="small" />
            ))}
          </Table.tr>
        </Table.ts>
        <Table.ts title={`§e${t("skyblock.minibosses")}`}>
          <Table.tr>
            {crimson.minibosses.map(({ boss, kills }) => (
              <Table.td title={prettify(boss)} value={t(kills)} color="§e" size="small" />
            ))}
          </Table.tr>
        </Table.ts>
      </Table.table>
      <Footer logo={logo} user={user} />
    </Container>
  );
};
