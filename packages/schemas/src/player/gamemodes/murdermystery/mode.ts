/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type APIData, formatTime, prettify } from "@statsify/util";
import { Field } from "#metadata";
import { Progression } from "#progression";
import { ratio } from "@statsify/math";

export class BaseMurderMysteryMode {
  @Field()
  public wins: number;

  @Field()
  public gamesPlayed: number;

  @Field()
  public bowKills: number;

  @Field()
  public goldPickedUp: number;

  public constructor(data: APIData, mode: string) {
    mode = mode ? `_${mode}` : mode;

    this.goldPickedUp = data[`coins_pickedup${mode}`];

    this.wins = data[`wins${mode}`];
    this.gamesPlayed = data[`games${mode}`];

    this.bowKills = data[`bow_kills${mode}`];
  }
}

export class StandardMurderMysteryMode extends BaseMurderMysteryMode {
  @Field()
  public kills: number;

  @Field()
  public deaths: number;

  @Field()
  public kdr: number;

  @Field()
  public trapKills: number;

  @Field()
  public thrownKnifeKills: number;

  @Field()
  public heroWins: number;

  @Field()
  public detectiveWins: number;

  @Field()
  public murdererWins: number;

  @Field()
  public killsAsMurderer: number;

  @Field()
  public suicides: number;

  public constructor(data: APIData, mode: string) {
    super(data, mode);
    mode = mode ? `_${mode}` : mode;

    this.kills = data[`kills${mode}`];
    this.deaths = data[`deaths${mode}`];
    this.kdr = ratio(this.kills, this.deaths);

    this.trapKills = data[`trap_kills${mode}`];
    this.thrownKnifeKills = data[`thrown_knife_kills${mode}`];

    this.heroWins = data[`was_hero${mode}`];
    this.detectiveWins = data[`detective_wins${mode}`];
    this.murdererWins = data[`murderer_wins${mode}`];
    this.killsAsMurderer = data[`kills_as_murderer${mode}`];
    this.suicides = data[`suicides${mode}`];
  }
}

export class ClassicMurderMysteryMode extends StandardMurderMysteryMode {
  @Field({
    leaderboard: { sort: "ASC", formatter: formatTime },
    historical: { enabled: false },
  })
  public fastestDetectiveWin: number;

  @Field({
    leaderboard: { sort: "ASC", formatter: formatTime },
    historical: { enabled: false },
  })
  public fastestMurdererWin: number;

  public constructor(data: APIData, mode: string) {
    super(data, mode);
    mode = mode ? `_${mode}` : mode;

    this.fastestDetectiveWin =
      (data[`quickest_detective_win_time_seconds${mode}`] ?? 0) * 1000;
    this.fastestMurdererWin =
      (data[`quickest_murderer_win_time_seconds${mode}`] ?? 0) * 1000;
  }
}

export class InfectionMurderMysteryMode extends BaseMurderMysteryMode {
  @Field()
  public alphaWins: number;

  @Field()
  public killsAsAlpha: number;

  @Field()
  public killsAsSurvivor: number;

  @Field()
  public killsAsInfected: number;

  @Field()
  public lastAliveGames: number;

  public constructor(data: APIData, mode: string) {
    super(data, mode);

    this.alphaWins = data.survivor_wins_MURDER_INFECTION;

    this.killsAsSurvivor = data.kills_as_survivor_MURDER_INFECTION;

    this.killsAsInfected = data.kills_as_infected_MURDER_INFECTION;
    this.lastAliveGames = data.last_one_alive_MURDER_INFECTION;
  }
}

export class AssassinsMurderMysteryMode extends BaseMurderMysteryMode {
  @Field()
  public kills: number;

  @Field()
  public deaths: number;

  @Field()
  public kdr: number;

  @Field()
  public trapKills: number;

  @Field()
  public thrownKnifeKills: number;

  @Field()
  public knifeKills: number;

  public constructor(data: APIData, mode: string) {
    super(data, mode);

    this.kills = data.kills_MURDER_ASSASSINS;
    this.deaths = data.deaths_MURDER_ASSASSINS;
    this.kdr = ratio(this.kills, this.deaths);

    this.trapKills = data.trap_kills_MURDER_ASSASSINS;
    this.thrownKnifeKills = data.thrown_knife_kills_MURDER_ASSASSINS;
    this.knifeKills = data.knife_kills_MURDER_ASSASSINS;
  }
}

const KNIFE_EXP_LIMITS: Record<string, number> = {
  none: 200,
  vip: 200,
  mvp: 200,
};

const KNIFE_NAMES: Record<string, string> = {
  "none": "Default Iron Sword",
  "10000_spoons": "10,000 Spoons",
  "apple": "Unfortunately Colored Jacket",
  "basted_turkey": "Basted Turkey",
  "blaze_stick": "Blaze Rod",
  "bloody_brick": "Bloody Brick",
  "bone": "Big Bone",
  "campfire_leftovers": "Campfire Leftovers",
  "carrot_on_stick": "Somewhat Sharp Rock",
  "cheapo": "Cheapo Sword",
  "cheese": "Freshly Frozen Baguette",
  "chewed_bush": "Chewed Up Bush",
  "diamond_shovel": "Only the Best",
  "earthen_dagger": "Earthen Dagger",
  "easter_basket": "Easter Basket",
  "farming_implement": "Farming Implement",
  "feather": "Jagged Knife",
  "fragile_plant": "Fragile Plant",
  "frisbee": "Frisbee",
  "glistening_melon": "Glistening Melon",
  "gold_digger": "Gold Digger",
  "grilled_steak": "Grilled Steak",
  "grimoire": "Grimoire",
  "ice_shard": "Ice Shard",
  "mvp": "MVP Diamond Sword",
  "mouse_trap": "Mouse Trap",
  "prickly": "Prickly",
  "pumpkin_pie": "Pumpkin Pie",
  "rudolphs_nose": "Rudolph's Nose",
  "rudolphs_snack": "Rudolph's Favorite Snack",
  "salmon": "Salmon",
  "scythe": "The Scythe",
  "shears": "Shears",
  "shiny_snack": "Sparkly Snack",
  "shovel": "Shovel",
  "shred": "Shred",
  "stake": "Stake",
  "stick_with_hat": "Stick with a Hat",
  "stick": "Stick",
  "sweet_treat": "Sweet Treat",
  "timber": "Timber",
  "vip": "VIP Golden Sword",
  "wood_axe": "Wooden Axe",
  "double_death_scythe": "Double Death Scythe",
  "spray_painted_shovel": "Gold Spray Painted Shovel",
};

export class MurderMysteryKnife {
  @Field({ store: { default: "none" } })
  public kind: string;

  @Field({ store: { default: KNIFE_NAMES.none } })
  public name: string;

  @Field()
  public progression: Progression;

  public constructor(data: APIData) {
    this.kind = data.active_knife_skin?.replace("knife_skin_", "") ?? "none";

    if (this.kind === "random_cosmetic") {
      let max: [string, number] | undefined = undefined;

      const knifes = Object.entries(data?.knifeSkinPrestiges?.xp ?? {} as Record<string, number>) as [string, number][];

      for (const knife of knifes) {
        const value = knife[1];

        if (max === undefined || value > max[1])
          max = knife;
      }

      this.kind = max?.[0] ?? "none";
    }

    this.name = KNIFE_NAMES[this.kind] ?? prettify(this.kind);

    const xp = data?.knifeSkinPrestiges?.xp?.[this.kind] ?? 0;
    const max = KNIFE_EXP_LIMITS[this.kind] ?? 500;

    this.progression = new Progression(xp, max);
  }
}
