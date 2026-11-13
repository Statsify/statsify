/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  ArenaDuels,
  BedwarsDuels,
  BlitzSGDuels,
  BridgeDuels,
  MegaWallsDuels,
  MultiPVPDuelsGameMode,
  ParkourDuels,
  QuakeDuels,
  SingleBowPVPDuelsGameMode,
  SinglePVPDuelsGameMode,
  SkyWarsDuels,
  SpleefDuels,
  UHCDuels,
} from "./mode.js";
import { type ExtractGameModes, GameModes } from "#game";
import { Field } from "#metadata";
import type { APIData } from "@statsify/util";


export class Duels {
  @Field({ store: { default: 300 }, leaderboard: { enabled: false } })
  public pingRange: number;

  @Field({
    leaderboard: { extraDisplay: "this.overall.titleFormatted" },
    historical: { enabled: false },
  })
  public tokens: number;

  @Field({ leaderboard: { extraDisplay: "this.overall.titleFormatted" } })
  public overall: SingleBowPVPDuelsGameMode;

  @Field({ leaderboard: { extraDisplay: "this.arena.titleFormatted" } })
  public arena: ArenaDuels;

  @Field({
    leaderboard: {
      fieldName: "BlitzSG",
      extraDisplay: "this.blitzsg.titleFormatted",
    },
  })
  public blitzsg: BlitzSGDuels;

  @Field({ leaderboard: { extraDisplay: "this.bow.titleFormatted" } })
  public bow: SingleBowPVPDuelsGameMode;

  @Field({ leaderboard: { extraDisplay: "this.boxing.titleFormatted" } })
  public boxing: SinglePVPDuelsGameMode;

  @Field({ leaderboard: { extraDisplay: "this.bridge.titleFormatted" } })
  public bridge: BridgeDuels;

  @Field({ leaderboard: { name: "", extraDisplay: "this.bedwars.titleFormatted" } })
  public bedwars: BedwarsDuels;

  @Field({ leaderboard: { extraDisplay: "this.classic.titleFormatted" } })
  public classic: MultiPVPDuelsGameMode;

  @Field({ leaderboard: { extraDisplay: "this.combo.titleFormatted" } })
  public combo: SinglePVPDuelsGameMode;

  @Field({
    leaderboard: {
      fieldName: "MegaWalls",
      extraDisplay: "this.megawalls.titleFormatted",
    },
  })
  public megawalls: MegaWallsDuels;

  @Field({
    leaderboard: {
      fieldName: "NoDebuff",
      extraDisplay: "this.nodebuff.titleFormatted",
    },
  })
  public nodebuff: SinglePVPDuelsGameMode;

  @Field({ leaderboard: { fieldName: "OP", extraDisplay: "this.op.titleFormatted" } })
  public op: MultiPVPDuelsGameMode;

  @Field({ leaderboard: { extraDisplay: "this.parkour.titleFormatted" } })
  public parkour: ParkourDuels;

  @Field({ leaderboard: { extraDisplay: "this.quake.titleFormatted" } })
  public quake: QuakeDuels;

  @Field({
    leaderboard: {
      fieldName: "SkyWars",
      extraDisplay: "this.skywars.titleFormatted",
    },
  })
  public skywars: SkyWarsDuels;

  @Field({ leaderboard: { fieldName: "", extraDisplay: "this.spleef.titleFormatted" } })
  public spleef: SpleefDuels;

  @Field({ leaderboard: { extraDisplay: "this.sumo.titleFormatted" } })
  public sumo: SinglePVPDuelsGameMode;

  @Field({
    leaderboard: { fieldName: "UHC", extraDisplay: "this.uhc.titleFormatted" },
  })
  public uhc: UHCDuels;

  @Field()
  public scheme: string;

  @Field()
  public icon: string;

  public constructor(data: APIData) {
    this.overall = new SingleBowPVPDuelsGameMode(data, "", "", "overall");
    this.overall.winstreak = data?.currentStreak ?? this.overall.winstreak;
    this.arena = new ArenaDuels(data);

    this.blitzsg = new BlitzSGDuels(data);
    this.bow = new SingleBowPVPDuelsGameMode(data, "Bow", "bow_duel", "default");
    this.boxing = new SinglePVPDuelsGameMode(data, "Boxing", "boxing_duel", "half");
    this.bedwars = new BedwarsDuels(data);

    this.bridge = new BridgeDuels(data);
    this.classic = new MultiPVPDuelsGameMode(data, "Classic", "classic", "classic", "default");
    this.combo = new SinglePVPDuelsGameMode(data, "Combo", "combo_duel", "default");

    this.megawalls = new MegaWallsDuels(data);

    this.nodebuff = new SinglePVPDuelsGameMode(data, "NoDebuff", "potion_duel", "half");
    this.op = new MultiPVPDuelsGameMode(data, "OP", "op", "op", "default");

    this.parkour = new ParkourDuels(data);
    this.quake = new QuakeDuels(data);
    this.skywars = new SkyWarsDuels(data);
    this.spleef = new SpleefDuels(data);
    this.sumo = new SinglePVPDuelsGameMode(data, "Sumo", "sumo_duel", "default");
    this.uhc = new UHCDuels(data);

    this.pingRange = data?.pingPreference ?? 300;
    this.tokens = data.coins;

    this.icon = data.active_prefix_icon;
    this.scheme = data.active_prefix_scheme;
  }
}

export * from "./mode.js";
