/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Container, Footer, Header, WordWrap } from "#components";
import { FormattedGame } from "@statsify/schemas";
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
            <Perk perk={normalPerks.slot1} perkIcons={perkIcons} />
            <Perk perk={insanePerks.slot1} perkIcons={perkIcons} />
          </div>
        </div>
        <div width="100%" height="1/6">
          <box height="100%"><text>2</text></box>
          <div width="remaining" height="100%">
            <Perk perk={normalPerks.slot2} perkIcons={perkIcons} />
            <Perk perk={insanePerks.slot2} perkIcons={perkIcons} />
          </div>
        </div>
        <div width="100%" height="1/6">
          <box height="100%"><text>3</text></box>
          <div width="remaining" height="100%">
            <Perk perk={normalPerks.slot3} perkIcons={perkIcons} />
            <Perk perk={insanePerks.slot3} perkIcons={perkIcons} />
          </div>
        </div>
        <div width="100%" height="1/6">
          <box height="100%"><text>4</text></box>
          <div width="remaining" height="100%">
            <Perk perk={normalPerks.slot4} perkIcons={perkIcons} />
            <Perk perk={insanePerks.slot4} perkIcons={perkIcons} />
          </div>
        </div>
        <div width="100%" height="1/6">
          <box height="100%"><text>5</text></box>
          <div width="remaining" height="100%">
            <Perk perk={normalPerks.slot5} perkIcons={perkIcons} />
            <Perk perk={insanePerks.slot5} perkIcons={perkIcons} />
          </div>
        </div>
        <div width="100%" height="1/6">
          <box height="100%"><text>6</text></box>
          <div width="remaining" height="100%">
            <Perk perk={normalPerks.slot6} perkIcons={perkIcons} />
            <Perk perk={insanePerks.slot6} perkIcons={perkIcons} />
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

function Perk({ perk, perkIcons }: { perk: string | undefined; perkIcons: Record<string, Image> }) {
  let name = "§cEmpty";
  let description = "No perks selected in this slot";

  if (perk) {
    if (perk in perks) {
      name = perks[perk].name;
      description = perks[perk].description;
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
          <WordWrap align="left" maxWidth={350} margin={{ left: 6, top: 2, bottom: 6, right: 6 }} color="§7">
            §7{description}
          </WordWrap>
        </div>
      </div>
    </box>
  );
}

const perks: Record<string, { name: string; description: string }> = {
  bridger: { name: "§aBridger", description: "§a50% §7chance to not consume blocks" },
  knowledge: { name: "§aKnowledge", description: "Gain §33 EXP §7Levels per kill" },
  lucky_charm: { name: "§aLucky Charm", description: "§a30% §7chance to get a §6Golden Apple §7on kill" },
  mining_expertise: { name: "§aMining Expertise", description: "Chance for 1 extra ore per mined block" },
  nourishment: { name: "§aNourishment", description: "Refill hunger and saturation every kill" },
  resistance_boost: { name: "§aResistance Boost", description: "§e15s §7of §bResistance II §7at game start" },
  savior: { name: "§aSavior", description: "Gain §bAbsorption I §7for §e7s §7on enemy kill" },
  annony_o_mite: { name: "§9Annony-o-mite", description: "§a10% §7chance to spawn §8Silverfish §7on bow hit" },
  arrow_recovery: { name: "§9Arrow Recovery", description: "§a50% §7chance to recover arrow on hit" },
  blazing_arrows: { name: "§9Blazing Arrows", description: "§a15% §7chance for fire arrows" },
  environmental_expert: { name: "§9Environmental Expert", description: "§a50% §7reduced environmental damage" },
  fat: { name: "§9Fat", description: "§e20s §7of §bAbsorption I §7at game start" },
  speed_boost: { name: "§9Speed Boost", description: "Gain §bHaste II §7for §e300s §7at game start" },
  barbarian: { name: "§6Barbarian", description: "Gain a §bSharpness §7level after 3 axe kills" },
  black_magic: { name: "§6Black Magic", description: "§a30% §7chance for §5Ender Pearl §7after void kill" },
  frost: { name: "§6Frost", description: "§a40% §7chance for §bSlowness I §7on bow hit" },
  marksmanship: { name: "§6Marksmanship", description: "Gain §bPower I §7on bows after 2 bow kills" },
  necromancer: { name: "§6Necromancer", description: "§a16% §7chance to spawn friendly §2Zombie §7on kill" },
  revenge: { name: "§6Revenge", description: "Spawn a §4Spider §7on death" },
  robbery: { name: "§6Robbery", description: "§a20% §7chance to drop item on fist hit" },
  apothecary: { name: "§5Apothecary", description: "Extend positive potion effects by §a30%" },
  diamond_in_the_rough: { name: "§5Diamond in the Rough", description: "§a5% §7chance for §bDiamond §7drop on kill" },
  ender_end_game: { name: "§5Ender End Game", description: "§a+10% §7chance for §5Ender Pearl §7on chest refills" },
  fruit_finder: { name: "§5Fruit Finder", description: "Guaranteed §6Golden Apple §7in first Middle Chest" },
  librarian: { name: "§5Librarian", description: "Every 3 kills, get a random enchanted book" },
  tenacity: { name: "§5Tenacity", description: "Heal 1 §cHeart §7per kill" },
  fortune_teller: { name: "§5Fortune Teller", description: "Level 2 enchants guarantee §bProtection I §7and §bSharpness I" },
  hide_and_seek: { name: "§5Hide and Seek", description: "Get a compass §e10s §7before first chest refill" },
  diamondpiercer: { name: "§6Diamondpiercer", description: "§a20% §7chance for §a20% §7extra damage to §bDiamond Armor" },
};
