/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Field } from "#metadata";
import { add } from "@statsify/math";
import type { APIData } from "@statsify/util";

export class WarlordsSpecification {
  @Field()
  public wins: number;

  @Field()
  public damage: number;

  @Field()
  public prevent: number;

  @Field()
  public healing: number;

  @Field({ leaderboard: { enabled: false } })
  public total: number;

  public constructor(data: APIData, mode: string) {
    this.wins = data[`wins_${mode}`];

    this.damage = data[`damage_${mode}`];
    this.prevent = data[`damage_prevented_${mode}`];
    this.healing = data[`heal_${mode}`];

    this.total = add(this.damage, this.prevent, this.healing);
  }
}

export class WarlordsClass extends WarlordsSpecification {
  @Field({ store: { default: "none" } })
  public specification: string;

  // Warlords class level maxes out at 90
  @Field({ leaderboard: { enabled: false } })
  public level: number;

  @Field()
  public attack: WarlordsSpecification;

  @Field()
  public defense: WarlordsSpecification;

  @Field()
  public healer: WarlordsSpecification;

  public constructor(data: APIData, clazz: string, attack: string, defense: string, tank: string) {
    super(data, clazz);

    this.specification = data[`${clazz}_spec`] ?? "none";
    this.level = add(
      data[`${clazz}_cooldown`],
      data[`${clazz}_critchance`],
      data[`${clazz}_critmultiplier`],
      data[`${clazz}_energy`],
      data[`${clazz}_health`],
      data[`${clazz}_skill1`],
      data[`${clazz}_skill2`],
      data[`${clazz}_skill3`],
      data[`${clazz}_skill4`],
      data[`${clazz}_skill5`]
    );
    this.attack = new WarlordsSpecification(data, attack);
    this.defense = new WarlordsSpecification(data, defense);
    this.healer = new WarlordsSpecification(data, tank);
  }
}

export class WarlordsShaman extends WarlordsClass {
  @Field({ leaderboard: { name: "Thunderlord" } })
  declare public attack: WarlordsSpecification;

  @Field({ leaderboard: { name: "Spiritguard" } })
  declare public defense: WarlordsSpecification;

  @Field({ leaderboard: { name: "Earthwarden" } })
  declare public healer: WarlordsSpecification;

  public constructor(data: APIData) {
    super(data, "shaman", "thunderlord", "spiritguard", "earthwarden");
  }
}

export class WarlordsMage extends WarlordsClass {
  @Field({ leaderboard: { name: "Pyromancer" } })
  declare public attack: WarlordsSpecification;

  @Field({ leaderboard: { name: "Cryomancer" } })
  declare public defense: WarlordsSpecification;

  @Field({ leaderboard: { name: "Aquamancer" } })
  declare public healer: WarlordsSpecification;

  public constructor(data: APIData) {
    super(data, "mage", "pyromancer", "cryomancer", "aquamancer");
  }
}

export class WarlordsWarrior extends WarlordsClass {
  @Field({ leaderboard: { name: "Berserker" } })
  declare public attack: WarlordsSpecification;

  @Field({ leaderboard: { name: "Defender" } })
  declare public defense: WarlordsSpecification;

  @Field({ leaderboard: { name: "Revenant" } })
  declare public healer: WarlordsSpecification;

  public constructor(data: APIData) {
    super(data, "warrior", "berserker", "defender", "revenant");
  }
}

export class WarlordsPaladin extends WarlordsClass {
  @Field({ leaderboard: { name: "Avenger" } })
  declare public attack: WarlordsSpecification;

  @Field({ leaderboard: { name: "Crusader" } })
  declare public defense: WarlordsSpecification;

  @Field({ leaderboard: { name: "Protector" } })
  declare public healer: WarlordsSpecification;

  public constructor(data: APIData) {
    super(data, "paladin", "avenger", "crusader", "protector");
  }
}
