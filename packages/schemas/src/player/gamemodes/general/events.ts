/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Field } from "#metadata";
import { Progression } from "#progression";
import type { APIData } from "@statsify/util";

const MAX_LEVEL = 100;

export class Event {
  @Field({ leaderboard: { fieldName: "EXP" } })
  public exp: number;

  @Field({ leaderboard: { enabled: false }, store: { default: 1 } })
  public level: number;

  @Field()
  public progression: Progression;

  public constructor(expRequirement: number, data: APIData = {}) {
    this.exp = data.levelling?.experience ?? 0;
    this.level = Math.min(MAX_LEVEL, Math.floor(this.exp / expRequirement) + 1);

    this.progression = new Progression(
      this.exp % expRequirement,
      this.level >= MAX_LEVEL ? 0 : expRequirement
    );
  }
}

export type EventType = { period: EventPeriod; year: number; key: Exclude<keyof Events, "silver"> };
export type EventPeriod = "summer" | "halloween" | "christmas" | "easter";

export const EVENT_TYPES: EventType[] = [
  { period: "christmas", year: 2024, key: "christmas2024" },
  { period: "halloween", year: 2024, key: "halloween2024" },
  { period: "summer", year: 2024, key: "summer2024" },
  { period: "easter", year: 2024, key: "easter2024" },
  { period: "christmas", year: 2023, key: "christmas2023" },
  { period: "halloween", year: 2023, key: "halloween2023" },
  { period: "summer", year: 2023, key: "summer2023" },
  { period: "easter", year: 2023, key: "easter2023" },
  { period: "christmas", year: 2022, key: "christmas2022" },
  { period: "halloween", year: 2022, key: "halloween2022" },
  { period: "summer", year: 2022, key: "summer2022" },
];

export class Events {
  @Field({ leaderboard: { name: "Summer 2022" } })
  public summer2022: Event;

  @Field({ leaderboard: { name: "Halloween 2022" } })
  public halloween2022: Event;

  @Field({ leaderboard: { name: "Christmas 2022" } })
  public christmas2022: Event;

  @Field({ leaderboard: { name: "Easter 2023" } })
  public easter2023: Event;

  @Field({ leaderboard: { name: "Summer 2023" } })
  public summer2023: Event;

  @Field({ leaderboard: { name: "Halloween 2023" } })
  public halloween2023: Event;

  @Field({ leaderboard: { name: "Christmas 2023" } })
  public christmas2023: Event;

  @Field({ leaderboard: { name: "Easter 2024" } })
  public easter2024: Event;

  @Field({ leaderboard: { name: "Summer 2024" } })
  public summer2024: Event;

  @Field({ leaderboard: { name: "Halloween 2024" } })
  public halloween2024: Event;

  @Field({ leaderboard: { name: "Christmas 2024" } })
  public christmas2024: Event;

  @Field()
  public silver: number;

  public constructor(data: APIData = {}) {
    this.summer2022 = new Event(25_000, data.summer?.["2022"]);
    this.halloween2022 = new Event(10_000, data.halloween?.["2022"]);
    this.christmas2022 = new Event(10_000, data.christmas?.["2022"]);
    this.easter2023 = new Event(10_000, data.easter?.["2023"]);
    this.summer2023 = new Event(25_000, data.summer?.["2023"]);
    this.halloween2023 = new Event(10_000, data.halloween?.["2023"]);
    this.christmas2023 = new Event(10_000, data.christmas?.["2023"]);
    this.easter2024 = new Event(10_000, data.easter?.["2024"]);
    this.summer2024 = new Event(25_000, data.summer?.["2024"]);
    this.halloween2024 = new Event(10_000, data.halloween?.["2024"]);
    this.christmas2024 = new Event(10_000, data.christmas?.["2024"]);

    this.silver = data.silver;
  }
}
