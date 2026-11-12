/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Background, Footer, HeaderNametag, Skin, Table } from "../components/index.js";
import { DateTime } from "luxon";
import type { Guild, Player } from "@statsify/schemas";
import type { Image } from "skia-canvas";
import type { LocalizeFunction } from "../types.js";

export interface UpdatedStampProps {
  /** When the player's stats were fetched, in ms. */
  updatedAt: number;
  t: LocalizeFunction;
}

/**
 * "Updated" over `2026-10-20 01:12 UTC`, small and gray: the lines that tell a forum reader how old the
 * stats are, since a signature's URL never changes. Two lines, so it fits beside the footer, from a key each, since
 * another language may order or space the words differently.
 */
export const UpdatedStamp = ({ updatedAt, t }: UpdatedStampProps) => {
  const date = DateTime.fromMillis(updatedAt, { zone: "utc" }).toFormat("yyyy-LL-dd HH:mm");

  return (
    <div direction="column" location="center">
      <text size={1} margin={{ top: 4, bottom: 1, left: 4, right: 4 }}>{`§7${t("stats.updated")}`}</text>
      <text size={1} margin={{ top: 1, bottom: 4, left: 4, right: 4 }}>{`§7${t("stats.updatedDate", { date })}`}</text>
    </div>
  );
};

interface SignatureStatProps {
  title: string;
  value: string;
  color: string;
}

/** `Table.td`'s small cell with its spacing halved, so two rows fit under the name in 200 px. */
const SignatureStat = ({ title, value, color }: SignatureStatProps) => (
  <box direction="column" location="center" width="100%" padding={{ left: 5, right: 5 }}>
    <text margin={{ top: 2, bottom: 0, left: 1, right: 1 }}>{`${color}${title}`}</text>
    <text margin={{ top: 0, bottom: 2 }}>{`${color}${value}`}</text>
  </box>
);

export interface SignatureProfileProps {
  width: number;
  height: number;
  background: Image;
  logo: Image;
  skin: Image;
  player: Player;
  guild?: Guild;
  updatedAt: number;
  t: LocalizeFunction;
}

/**
 * The forum signature: the general card's skin, nametag and four of its stats laid out on a
 * `width`×`height` canvas, with the Statsify footer and the "Updated" stamp along the bottom.
 */
export const SignatureProfile = ({
  width,
  height,
  background,
  logo,
  skin,
  player,
  guild,
  updatedAt,
  t,
}: SignatureProfileProps) => {
  const { general, quests } = player.stats;

  return (
    <div width={width} height={height}>
      <Background background={background}>
        <div width="97%" height="97%" align="center">
          <Skin skin={skin} />
          <div direction="column" width="remaining" height="100%">
            <HeaderNametag name={`${player.displayName}${guild?.tag ? ` ${guild.tagFormatted}` : ""}`} size={2} />
            <Table.table>
              <Table.tr>
                <SignatureStat title={t("stats.networkLevel")} value={t(general.networkLevel)} color="§6" />
                <SignatureStat
                  title={t("stats.achievementPoints")}
                  value={t(general.achievementPoints)}
                  color="§6"
                />
              </Table.tr>
              <Table.tr>
                <SignatureStat title={t("stats.karma")} value={t(general.karma)} color="§d" />
                <SignatureStat title={t("stats.quests")} value={t(quests.total)} color="§a" />
              </Table.tr>
            </Table.table>
            {/* The footer takes the two-line stamp's height, so the row's boxes are even. */}
            <div width="100%">
              <div width="remaining" height="100%">
                <Footer logo={logo} user={null} height="100%" />
              </div>
              <box>
                <UpdatedStamp updatedAt={updatedAt} t={t} />
              </box>
            </div>
          </div>
        </div>
      </Background>
    </div>
  );
};
