/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Container, Footer, Header, WordWrap } from "#components";
import { FormattedGame } from "@statsify/schemas";
import { LocalizeFunction } from "@statsify/discord";
import { prettify } from "@statsify/util";
import type { BaseProfileProps } from "#commands/base.hypixel-command";
import type { Image } from "skia-canvas";
import type { PerkIcons } from "./skywars.command.js";

export interface SkyWarsPerksProfileProps extends Omit<BaseProfileProps, "time"> {
  perkIcons: PerkIcons;
}

export const SkyWarsPerksProfile = ({
  skin,
  player,
  background,
  logo,
  user,
  badge,
  perkIcons,
  t,
}: SkyWarsPerksProfileProps) => {
  const { normalPerks, insanePerks } = player.stats.skywars;

  return (
    <Container background={background}>
      <Header
        skin={skin}
        name={player.prefixName}
        badge={badge}
        title={`§l${FormattedGame.SKYWARS} §fPerks`}
        time="LIVE"
      />
      <div width="100%">
        <box border={{ topLeft: 4, topRight: 4, bottomLeft: 0, bottomRight: 0 }}><text>#</text></box>
        <div width="remaining">
          <box width="1/2" border={{ topLeft: 4, topRight: 4, bottomLeft: 0, bottomRight: 0 }}><text>§l§6Normal</text></box>
          <box width="1/2" border={{ topLeft: 4, topRight: 4, bottomLeft: 0, bottomRight: 0 }}><text>§l§6Insane</text></box>
        </div>
      </div>
      <div width="100%" direction="column">
        <div width="100%" height="1/6">
          <box height="100%"><text>1</text></box>
          <div width="remaining" height="100%">
            <Perk perk={normalPerks.slot1} perkIcons={perkIcons} t={t} />
            <Perk perk={insanePerks.slot1} perkIcons={perkIcons} t={t} />
          </div>
        </div>
        <div width="100%" height="1/6">
          <box height="100%"><text>2</text></box>
          <div width="remaining" height="100%">
            <Perk perk={normalPerks.slot2} perkIcons={perkIcons} t={t} />
            <Perk perk={insanePerks.slot2} perkIcons={perkIcons} t={t} />
          </div>
        </div>
        <div width="100%" height="1/6">
          <box height="100%"><text>3</text></box>
          <div width="remaining" height="100%">
            <Perk perk={normalPerks.slot3} perkIcons={perkIcons} t={t} />
            <Perk perk={insanePerks.slot3} perkIcons={perkIcons} t={t} />
          </div>
        </div>
        <div width="100%" height="1/6">
          <box height="100%"><text>4</text></box>
          <div width="remaining" height="100%">
            <Perk perk={normalPerks.slot4} perkIcons={perkIcons} t={t} />
            <Perk perk={insanePerks.slot4} perkIcons={perkIcons} t={t} />
          </div>
        </div>
        <div width="100%" height="1/6">
          <box height="100%"><text>5</text></box>
          <div width="remaining" height="100%">
            <Perk perk={normalPerks.slot5} perkIcons={perkIcons} t={t} />
            <Perk perk={insanePerks.slot5} perkIcons={perkIcons} t={t} />
          </div>
        </div>
        <div width="100%" height="1/6">
          <box height="100%"><text>6</text></box>
          <div width="remaining" height="100%">
            <Perk perk={normalPerks.slot6} perkIcons={perkIcons} t={t} />
            <Perk perk={insanePerks.slot6} perkIcons={perkIcons} t={t} />
          </div>
        </div>
      </div>
      <div width="100%">
        <box width={24} height={16} border={{ topLeft: 0, topRight: 0, bottomLeft: 4, bottomRight: 4 }} />
        <div width="remaining">
          <box width="1/2" height={16} border={{ topLeft: 0, topRight: 0, bottomLeft: 4, bottomRight: 4 }} />
          <box width="1/2" height={16} border={{ topLeft: 0, topRight: 0, bottomLeft: 4, bottomRight: 4 }} />
        </div>
      </div>
      <Footer logo={logo} user={user} />
    </Container>
  );
};

function Perk({ perk, perkIcons, t }: {
  perk: string | undefined;
  perkIcons: Record<string, Image>;
  t: LocalizeFunction;
}) {
  let name = "§cEmpty";
  let description = "No perks selected in this slot";

  if (perk) {
    if (perk in PERK_NAMES) {
      name = PERK_NAMES[perk];
      description = t(`skywars-perks.${perk}`);
    } else {
      name = prettify(perk);
      description = "N/A";
    }
  }

  return (
    <box
      width="1/2"
      height="100%"
      // border={{ topLeft: 0, bottomLeft: 0, topRight: 4, bottomRight: 4 }}
      padding={{ top: 4, bottom: 4, left: 8, right: 8 }}
      direction="column"
    >
      <div align="left">
        <img
          image={perk && perk in perkIcons ? perkIcons[perk] : perkIcons.none}
          width={32}
          height={32}
          margin={{ left: 4, right: 4 }}
        />
        <div direction="column">
          <text align="left" margin={{ left: 6, top: 6, bottom: 2, right: 6 }}>§l{name}</text>
          <WordWrap align="left" maxWidth={350} margin={{ left: 6, top: 2, bottom: 6, right: 6 }} color="">
            §7{description}
          </WordWrap>
        </div>
      </div>
    </box>
  );
}

const PERK_NAMES: Record<string, string> = {
  bridger: "§aBridger",
  knowledge: "§aKnowledge",
  lucky_charm: "§aLucky Charm",
  mining_expertise: "§aMining Expertise",
  nourishment: "§aNourishment",
  resistance_boost: "§aResistance Boost",
  savior: "§aSavior",
  annony_o_mite: "§9Annony-o-mite",
  arrow_recovery: "§9Arrow Recovery",
  blazing_arrows: "§9Blazing Arrows",
  environmental_expert: "§9Environmental Expert",
  fat: "§9Fat",
  speed_boost: "§9Speed Boost",
  barbarian: "§6Barbarian",
  black_magic: "§6Black Magic",
  frost: "§6Frost",
  marksmanship: "§6Marksmanship",
  necromancer: "§6Necromancer",
  revenge: "§6Revenge",
  robbery: "§6Robbery",
  apothecary: "§5Apothecary",
  diamond_in_the_rough: "§5Diamond in the Rough",
  ender_end_game: "§5Ender End Game",
  fruit_finder: "§5Fruit Finder",
  librarian: "§5Librarian",
  tenacity: "§5Tenacity",
  fortune_teller: "§5Fortune Teller",
  hide_and_seek: "§5Hide and Seek",
  diamondpiercer: "§6Diamondpiercer",
};
