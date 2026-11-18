/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Container, Footer, Table } from "#components";
import { ItemSlot } from "./components/ItemSlot.js";
import { RARITY_COLORS, pricesAsOf } from "./components/ItemGrid.js";
import type { Canvas, Image } from "skia-canvas";
import type { LocalizeFunction } from "@statsify/discord";
import type { PriceView } from "@statsify/skyblock";
import type { User } from "@statsify/schemas";

export const PRICE_ICON_SIZE = 64;

export interface SkyBlockPriceProfileProps {
  price: PriceView;
  icon?: Canvas;
  background: Image;
  logo: Image;
  user: User | null;
  t: LocalizeFunction;
}

export const SkyBlockPriceProfile = ({ price, icon, background, logo, user, t }: SkyBlockPriceProfileProps) => {
  const { bazaar, lowestBin, npc } = price;
  const coins = (value: number) => t(value >= 100 ? Math.floor(value) : value);
  const instant = (value?: number) => (value === undefined ? t("skyblock.none") : coins(value));

  return (
    <Container background={background}>
      <box width="100%" padding={{ left: 12, right: 12, top: 8, bottom: 8 }}>
        <ItemSlot icon={icon} size={PRICE_ICON_SIZE} />
        <div direction="column" margin={{ left: 12, right: 12 }}>
          <text align="left">{`§^3^${price.rarity ? RARITY_COLORS[price.rarity] : "§f"}${price.name}`}</text>
          <text align="left">{`§7${price.id}`}</text>
        </div>
      </box>
      <Table.table>
        {bazaar ?
          (
            <>
              <Table.tr>
                <Table.td title={t("skyblock.bazaarBuy")} value={instant(bazaar.instantBuy)} color="§a" />
                <Table.td title={t("skyblock.bazaarSell")} value={instant(bazaar.instantSell)} color="§6" />
              </Table.tr>
              <Table.tr>
                <Table.td title={t("skyblock.weeklyBuys")} value={t(bazaar.buyMovingWeek)} color="§b" />
                <Table.td title={t("skyblock.weeklySells")} value={t(bazaar.sellMovingWeek)} color="§b" />
              </Table.tr>
            </>
          ) :
          <></>}
        {lowestBin ?
          (
            <Table.tr>
              <Table.td title={t("skyblock.lowestBin")} value={coins(lowestBin.coins)} color="§6" />
              <Table.td title={t("skyblock.listings")} value={t(lowestBin.listings)} color="§e" />
            </Table.tr>
          ) :
          <></>}
        {npc === undefined ?
          <></> :
          (
            <Table.tr>
              <Table.td title={t("skyblock.npcSell")} value={coins(npc)} color="§e" />
            </Table.tr>
          )}
      </Table.table>
      <box width="100%">
        <text>{`§7${pricesAsOf(t, price.asOf)}`}</text>
      </box>
      <Footer logo={logo} user={user} />
    </Container>
  );
};
