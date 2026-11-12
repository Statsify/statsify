/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Container, Footer, Header, type SidebarItem, Table } from "#components";
import { DateTime } from "luxon";
import { prettify } from "@statsify/util";
import type { SkyBlockProfileProps } from "./skyblock.command.js";

export const SkyBlockSummaryProfile = ({
  profile,
  title,
  skin,
  badge,
  background,
  logo,
  user,
  t,
}: SkyBlockProfileProps) => {
  const { skills, dungeons, slayers, accessories, networth } = profile.member;

  const missing = (color: string) => (profile.newProfile ? { value: t(0), color } : { value: t("skyblock.apiOff"), color: "§c" });
  const notReady = { value: t("skyblock.notReady"), color: "§7" };
  const accessoryPower = profile.marketDown?.includes("accessories") ?
    notReady :
    accessories ? { value: t(accessories.accessoryPower), color: "§d" } : missing("§d");
  const bank =
    profile.bank === undefined ?
      missing("§6") :
      { value: `${t(Math.floor(profile.bank))}§7/§6${t(profile.bankLimit)}`, color: "§6" };

  const sidebar: SidebarItem[] = [
    [t("skyblock.level"), t(profile.level), profile.levelColor],
    [t("skyblock.purse"), t(Math.floor(profile.purse)), "§6"],
    [t("skyblock.bank"), bank.value, bank.color],
  ];

  if (profile.personalBank !== undefined && profile.personalBankLimit !== undefined)
    sidebar.push([t("skyblock.personalBank"), `${t(Math.floor(profile.personalBank))}§7/§6${t(profile.personalBankLimit)}`, "§6"]);

  sidebar.push([t("skyblock.bankTier"), prettify(profile.bankTier), "§6"]);
  if (profile.bankInterest !== undefined) sidebar.push([t("skyblock.bankInterest"), t(Math.round(profile.bankInterest)), "§6"]);

  const current = profile.members.filter(({ removed, invited }) => !removed && !invited).length;
  const left = profile.members.filter(({ removed }) => removed).length;
  const invited = profile.members.filter(({ invited }) => invited).length;
  const coop = [
    t(current),
    ...(left > 0 ? [`§7${t("skyblock.membersLeft", { count: left })}`] : []),
    ...(invited > 0 ? [`§7${t("skyblock.membersInvited", { count: invited })}`] : []),
  ].join(" §8• ");

  return (
    <Container background={background}>
      <Header skin={skin} name={profile.displayName} badge={badge} sidebar={sidebar} title={title} time="LIVE" />
      <Table.table>
        <Table.tr>
          <Table.td
            title={t("skyblock.networth")}
            {...(networth ? { value: t(Math.floor(networth.total)), color: "§6" } : notReady)}
          />
          <Table.td
            title={t("skyblock.nonCosmeticNetworth")}
            {...(networth ? { value: t(Math.floor(networth.nonCosmetic.total)), color: "§e" } : notReady)}
          />
        </Table.tr>
        <Table.tr>
          <Table.td
            title={t("skyblock.skillAverage")}
            {...(skills ? { value: t(skills.average), color: "§a" } : missing("§a"))}
          />
          <Table.td title={t("skyblock.catacombs")} value={t(dungeons!.catacombs.level)} color="§c" />
          <Table.td title={t("skyblock.classAverage")} value={t(dungeons!.classAverage)} color="§2" />
        </Table.tr>
        <Table.tr>
          <Table.td title={t("skyblock.slayerXp")} value={t(slayers!.xp)} color="§5" />
          <Table.td title={t("skyblock.accessoryPower")} {...accessoryPower} />
          <Table.td
            title={t("skyblock.fairySouls")}
            value={profile.maxFairySouls ? `${t(profile.fairySouls)}§7/${t(profile.maxFairySouls)}` : t(profile.fairySouls)}
            color="§d"
          />
        </Table.tr>
        <Table.tr>
          <Table.td
            title={t("skyblock.firstJoin")}
            value={profile.firstJoin ? DateTime.fromMillis(profile.firstJoin).toFormat("LL/dd/yy", { locale: t.locale }) : t("skyblock.none")}
            color="§b"
          />
          <Table.td title={t("skyblock.coopMembers")} value={coop} color="§e" />
        </Table.tr>
      </Table.table>
      <Footer logo={logo} user={user} />
    </Container>
  );
};
