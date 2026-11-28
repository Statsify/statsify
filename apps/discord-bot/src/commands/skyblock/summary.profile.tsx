/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Card } from "./components/Card.js";
import { type SidebarItem, Table } from "#components";
import { DateTime } from "luxon";
import { formatFraction } from "./components/ItemGrid.js";
import { prettify } from "@statsify/util";
import type { SkyBlockProfileProps } from "./skyblock.command.js";

export const SkyBlockSummaryProfile = ({
  profile,
  t,
  ...card
}: SkyBlockProfileProps) => {
  const { skills, dungeons, slayers, accessories, networth } = profile.member;

  const missing = (color: string) =>
    profile.newProfile
      ? { value: t(0), color }
      : { value: t("skyblock.apiOff"), color: "§c" };
  const notReady = { value: t("skyblock.notReady"), color: "§7" };

  const getAccessoryPower = () => {
    if (profile.marketDown?.includes("accessories")) return notReady;
    if (!accessories) return missing("§d");
    return { value: t(accessories.accessoryPower), color: "§d" };
  };
  const bank =
    profile.bank === undefined
      ? missing("§6")
      : {
          value: formatFraction(
            t,
            Math.floor(profile.bank),
            profile.bankLimit,
            "§6",
          ),
          color: "§6",
        };

  const sidebar: SidebarItem[] = [
    [t("skyblock.level"), t(profile.level), profile.levelColor],
    [t("skyblock.purse"), t(Math.floor(profile.purse)), "§6"],
    [t("skyblock.bank"), bank.value, bank.color],
  ];

  const { personalBank, personalBankLimit } = profile;
  if (personalBank !== undefined && personalBankLimit !== undefined) {
    sidebar.push([
      t("skyblock.personalBank"),
      formatFraction(t, Math.floor(personalBank), personalBankLimit, "§6"),
      "§6",
    ]);
  }

  sidebar.push([t("skyblock.bankTier"), prettify(profile.bankTier), "§6"]);

  const firstJoin = profile.firstJoin
    ? DateTime.fromMillis(profile.firstJoin).toFormat("LL/dd/yy", {
        locale: t.locale,
      })
    : t("skyblock.none");

  const { members } = profile;
  const current = members.filter(
    ({ removed, invited }) => !removed && !invited,
  ).length;
  const left = members.filter(({ removed }) => removed).length;
  const invited = members.filter(({ invited }) => invited).length;

  const coop = [t(current)];
  if (left > 0) coop.push(`§7${t("skyblock.membersLeft", { count: left })}`);
  if (invited > 0)
    coop.push(`§7${t("skyblock.membersInvited", { count: invited })}`);

  return (
    <Card {...card} name={profile.displayName} sidebar={sidebar}>
      <Table.table>
        <Table.tr>
          <Table.td
            title={t("skyblock.networth")}
            {...(networth
              ? { value: t(Math.floor(networth.total)), color: "§6" }
              : notReady)}
          />
          <Table.td
            title={t("skyblock.nonCosmeticNetworth")}
            {...(networth
              ? {
                  value: t(Math.floor(networth.nonCosmetic.total)),
                  color: "§e",
                }
              : notReady)}
          />
        </Table.tr>
        <Table.tr>
          <Table.td
            title={t("skyblock.skillAverage")}
            {...(skills
              ? { value: t(skills.average), color: "§a" }
              : missing("§a"))}
          />
          <Table.td
            title={t("skyblock.catacombs")}
            value={t(dungeons!.catacombs.level)}
            color="§c"
          />
          <Table.td
            title={t("skyblock.classAverage")}
            value={t(dungeons!.classAverage)}
            color="§2"
          />
        </Table.tr>
        <Table.tr>
          <Table.td
            title={t("skyblock.slayerXp")}
            value={t(slayers!.xp)}
            color="§5"
          />
          <Table.td
            title={t("skyblock.accessoryPower")}
            {...getAccessoryPower()}
          />
          <Table.td
            title={t("skyblock.fairySouls")}
            value={
              profile.maxFairySouls
                ? `${t(profile.fairySouls)}§7/${t(profile.maxFairySouls)}`
                : t(profile.fairySouls)
            }
            color="§d"
          />
        </Table.tr>
        <Table.tr>
          <Table.td
            title={t("skyblock.firstJoin")}
            value={firstJoin}
            color="§b"
          />
          <Table.td
            title={t("skyblock.coopMembers")}
            value={coop.join(" §8• ")}
            color="§e"
          />
        </Table.tr>
      </Table.table>
    </Card>
  );
};
