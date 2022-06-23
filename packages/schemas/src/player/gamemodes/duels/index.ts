/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { APIData } from "@statsify/util";
import { BridgeDuels, MultiDuelsGameMode, SingleDuelsGameMode, UHCDuels } from "./mode";
import { Field } from "../../../metadata";
import { GameModes, IGameModes } from "../../../game";

export const DUELS_MODES = new GameModes([
  { api: "overall" },
  { api: "arena", hypixel: "DUELS_DUEL_ARENA" },
  { api: "blitzsg", hypixel: "DUELS_BLITZ_DUEL", formatted: "Blitz SG" },
  { api: "bow", hypixel: "DUELS_BOW_DUEL" },
  { api: "bowSpleef", hypixel: "DUELS_BOWSPLEEF_DUEL" },
  { api: "boxing", hypixel: "DUELS_BOXING_DUEL" },
  { api: "bridge" },
  { api: "classic", hypixel: "DUELS_CLASSIC_DUEL" },
  { api: "combo", hypixel: "DUELS_COMBO_DUEL" },
  { api: "megawalls", formatted: "MegaWalls" },
  { api: "nodebuff", hypixel: "DUELS_POTION_DUEL", formatted: "NoDebuff" },
  { api: "op", formatted: "OP" },
  { api: "parkour", hypixel: "DUELS_PARKOUR_EIGHT" },
  { api: "skywars", formatted: "SkyWars" },
  { api: "sumo", hypixel: "DUELS_SUMO_DUEL" },
  { api: "uhc", formatted: "UHC" },

  { hypixel: "DUELS_MW_DUEL", formatted: "MegaWalls Solo" },
  { hypixel: "DUELS_MW_DOUBLES", formatted: "MegaWalls Doubles" },
  { hypixel: "DUELS_UHC_DUEL", formatted: "UHC Solo" },
  { hypixel: "DUELS_UHC_DOUBLES", formatted: "UHC Doubles" },
  { hypixel: "DUELS_UHC_FOUR", formatted: "UHC Fours" },
  { hypixel: "DUELS_UHC_MEETUP", formatted: "UHC Deathmatch" },
  { hypixel: "DUELS_SW_DUEL", formatted: "SkyWars Solo" },
  { hypixel: "DUELS_SW_DOUBLES", formatted: "SkyWars Doubles" },
  { hypixel: "DUELS_OP_DUEL", formatted: "OP Solo" },
  { hypixel: "DUELS_OP_DOUBLES", formatted: "OP Doubles" },
  { hypixel: "DUELS_BRIDGE_DUEL", formatted: "Bridge Solo" },
  { hypixel: "DUELS_BRIDGE_DOUBLES", formatted: "Bridge Doubles" },
  { hypixel: "DUELS_BRIDGE_THREES", formatted: "Bridge Threes" },
  { hypixel: "DUELS_BRIDGE_FOUR", formatted: "Bridge Fours" },
  { hypixel: "DUELS_BRIDGE_2V2V2V2", formatted: "Bridge 2v2v2v2" },
  { hypixel: "DUELS_BRIDGE_3V3V3V3", formatted: "Bridge 3v3v3v3" },
  { hypixel: "DUELS_CAPTURE_THREES", formatted: "Bridge CTF" },
]);

export type DuelsModes = IGameModes<typeof DUELS_MODES>;

export class Duels {
  @Field({ store: { default: 300 }, leaderboard: { enabled: false } })
  public pingRange: number;

  @Field()
  public coins: number;

  @Field()
  public lootChests: number;

  @Field({ leaderboard: { extraDisplay: "stats.duels.overall.titleFormatted" } })
  public overall: SingleDuelsGameMode;

  @Field({ leaderboard: { extraDisplay: "stats.duels.arena.titleFormatted" } })
  public arena: SingleDuelsGameMode;

  @Field({
    leaderboard: {
      fieldName: "BlitzSG",
      extraDisplay: "stats.duels.blitzsg.titleFormatted",
    },
  })
  public blitzsg: SingleDuelsGameMode;

  @Field({ leaderboard: { extraDisplay: "stats.duels.bow.titleFormatted" } })
  public bow: SingleDuelsGameMode;

  @Field({ leaderboard: { extraDisplay: "stats.duels.bowSpleef.titleFormatted" } })
  public bowSpleef: SingleDuelsGameMode;

  @Field({ leaderboard: { extraDisplay: "stats.duels.boxing.titleFormatted" } })
  public boxing: SingleDuelsGameMode;

  @Field({ leaderboard: { extraDisplay: "stats.duels.bridge.titleFormatted" } })
  public bridge: BridgeDuels;

  @Field({ leaderboard: { extraDisplay: "stats.duels.classic.titleFormatted" } })
  public classic: SingleDuelsGameMode;

  @Field({ leaderboard: { extraDisplay: "stats.duels.combo.titleFormatted" } })
  public combo: SingleDuelsGameMode;

  @Field({
    leaderboard: {
      fieldName: "MegaWalls",
      extraDisplay: "stats.duels.megawalls.titleFormatted",
    },
  })
  public megawalls: MultiDuelsGameMode;

  @Field({
    leaderboard: {
      fieldName: "NoDebuff",
      extraDisplay: "stats.duels.nodebuff.titleFormatted",
    },
  })
  public nodebuff: SingleDuelsGameMode;

  @Field({
    leaderboard: { fieldName: "OP", extraDisplay: "stats.duels.op.titleFormatted" },
  })
  public op: MultiDuelsGameMode;

  @Field({ leaderboard: { extraDisplay: "stats.duels.parkour.titleFormatted" } })
  public parkour: SingleDuelsGameMode;

  @Field({
    leaderboard: {
      fieldName: "SkyWars",
      extraDisplay: "stats.duels.skywars.titleFormatted",
    },
  })
  public skywars: MultiDuelsGameMode;

  @Field({ leaderboard: { extraDisplay: "stats.duels.sumo.titleFormatted" } })
  public sumo: SingleDuelsGameMode;

  @Field({
    leaderboard: { fieldName: "UHC", extraDisplay: "stats.duels.uhc.titleFormatted" },
  })
  public uhc: UHCDuels;

  public constructor(data: APIData) {
    this.overall = new SingleDuelsGameMode(data, "", "");
    this.arena = new SingleDuelsGameMode(data, "Arena", "duel_arena");

    this.blitzsg = new SingleDuelsGameMode(data, "Blitz", "blitz_duel");
    this.bow = new SingleDuelsGameMode(data, "Bow", "bow_duel");
    this.bowSpleef = new SingleDuelsGameMode(data, "TNT", "bowspleef_duel");
    this.boxing = new SingleDuelsGameMode(data, "Boxing", "boxing_duel");

    this.bridge = new BridgeDuels(data);
    this.classic = new SingleDuelsGameMode(data, "Classic", "classic_duel");
    this.combo = new SingleDuelsGameMode(data, "Combo", "combo_duel");
    this.megawalls = new MultiDuelsGameMode(data, "MW", "mw", "mega_walls");
    this.nodebuff = new SingleDuelsGameMode(data, "NoDebuff", "potion_duel");
    this.op = new MultiDuelsGameMode(data, "OP", "op", "op");

    this.parkour = new SingleDuelsGameMode(data, "Parkour", "parkour_eight");
    this.skywars = new MultiDuelsGameMode(data, "SkyWars", "sw", "skywars");
    this.sumo = new SingleDuelsGameMode(data, "Sumo", "sumo_duel");
    this.uhc = new UHCDuels(data);

    this.pingRange = data?.pingPreference ?? 300;
    this.coins = data.coins;
    this.lootChests = data.duels_chests;
  }
}

export * from "./mode";
