/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { APIData } from "@statsify/util";
import {
  BridgeDuels,
  MultiPVPDuelsGameMode,
  SingleDuelsGameMode,
  SinglePVPDuelsGameMode,
  UHCDuels,
} from "./mode";
import { Field } from "../../../metadata";
import { GameModes } from "../../../game";
import {
  GameType,
  GetMetadataModes,
  Mode,
  StatsifyApiModes,
} from "../../../metadata/GameType";

@GameType()
export class Duels {
  @Field({ store: { default: 300 }, leaderboard: { enabled: false } })
  public pingRange: number;

  @Field({ leaderboard: { extraDisplay: "this.overall.titleFormatted" } })
  public coins: number;

  @Field({ leaderboard: { extraDisplay: "this.overall.titleFormatted" } })
  public lootChests: number;

  @Mode()
  @Field({ leaderboard: { extraDisplay: "this.overall.titleFormatted" } })
  public overall: SinglePVPDuelsGameMode;

  @Mode("DUELS_DUEL_ARENA")
  @Field({ leaderboard: { extraDisplay: "this.arena.titleFormatted" } })
  public arena: SingleDuelsGameMode;

  @Mode("DUELS_BLITZ_DUEL", "BlitzSG")
  @Field({
    leaderboard: {
      fieldName: "BlitzSG",
      extraDisplay: "this.blitzsg.titleFormatted",
    },
  })
  public blitzsg: SinglePVPDuelsGameMode;

  @Mode("DUELS_BOW_DUEL")
  @Field({ leaderboard: { extraDisplay: "this.bow.titleFormatted" } })
  public bow: SinglePVPDuelsGameMode;

  @Mode("DUELS_BOWSPLEEF_DUEL")
  @Field({ leaderboard: { extraDisplay: "this.bowSpleef.titleFormatted" } })
  public bowSpleef: SingleDuelsGameMode;

  @Mode("DUELS_BOXING_DUEL")
  @Field({ leaderboard: { extraDisplay: "this.boxing.titleFormatted" } })
  public boxing: SinglePVPDuelsGameMode;

  @Mode()
  @Field({ leaderboard: { extraDisplay: "this.bridge.titleFormatted" } })
  public bridge: BridgeDuels;

  @Mode("DUELS_CLASSIC_DUEL")
  @Field({ leaderboard: { extraDisplay: "this.classic.titleFormatted" } })
  public classic: SinglePVPDuelsGameMode;

  @Mode("DUELS_COMBO_DUEL")
  @Field({ leaderboard: { extraDisplay: "this.combo.titleFormatted" } })
  public combo: SinglePVPDuelsGameMode;

  @Mode("", "MegaWalls")
  @Field({
    leaderboard: {
      fieldName: "MegaWalls",
      extraDisplay: "this.megawalls.titleFormatted",
    },
  })
  public megawalls: MultiPVPDuelsGameMode;

  @Mode("DUELS_POTION_DUEL", "NoDebuff")
  @Field({
    leaderboard: {
      fieldName: "NoDebuff",
      extraDisplay: "this.nodebuff.titleFormatted",
    },
  })
  public nodebuff: SinglePVPDuelsGameMode;

  @Mode("", "OP")
  @Field({
    leaderboard: { fieldName: "OP", extraDisplay: "this.op.titleFormatted" },
  })
  public op: MultiPVPDuelsGameMode;

  @Mode("DUELS_PARKOUR_EIGHT")
  @Field({ leaderboard: { extraDisplay: "this.parkour.titleFormatted" } })
  public parkour: SingleDuelsGameMode;

  @Mode("", "SkyWars")
  @Field({
    leaderboard: {
      fieldName: "SkyWars",
      extraDisplay: "this.skywars.titleFormatted",
    },
  })
  public skywars: MultiPVPDuelsGameMode;

  @Mode("DUELS_SUMO_DUEL")
  @Field({ leaderboard: { extraDisplay: "this.sumo.titleFormatted" } })
  public sumo: SinglePVPDuelsGameMode;

  @Mode("", "UHC")
  @Field({
    leaderboard: { fieldName: "UHC", extraDisplay: "this.uhc.titleFormatted" },
  })
  public uhc: UHCDuels;

  public constructor(data: APIData) {
    this.overall = new SinglePVPDuelsGameMode(data, "", "");
    this.arena = new SinglePVPDuelsGameMode(data, "Arena", "duel_arena");

    this.blitzsg = new SinglePVPDuelsGameMode(data, "Blitz", "blitz_duel");
    this.bow = new SinglePVPDuelsGameMode(data, "Bow", "bow_duel");
    this.bowSpleef = new SinglePVPDuelsGameMode(data, "TNT", "bowspleef_duel");
    this.boxing = new SinglePVPDuelsGameMode(data, "Boxing", "boxing_duel");

    this.bridge = new BridgeDuels(data);
    this.classic = new SinglePVPDuelsGameMode(data, "Classic", "classic_duel");
    this.combo = new SinglePVPDuelsGameMode(data, "Combo", "combo_duel");
    this.megawalls = new MultiPVPDuelsGameMode(data, "MW", "mw", "mega_walls");
    this.nodebuff = new SinglePVPDuelsGameMode(data, "NoDebuff", "potion_duel");
    this.op = new MultiPVPDuelsGameMode(data, "OP", "op", "op");

    this.parkour = new SinglePVPDuelsGameMode(data, "Parkour", "parkour_eight");
    this.skywars = new MultiPVPDuelsGameMode(data, "SkyWars", "sw", "skywars");
    this.sumo = new SinglePVPDuelsGameMode(data, "Sumo", "sumo_duel");
    this.uhc = new UHCDuels(data);

    this.pingRange = data?.pingPreference ?? 300;
    this.coins = data.coins;
    this.lootChests = data.duels_chests;
  }
}

export type DuelsModes = StatsifyApiModes<Duels>;

export const DUELS_MODES = new GameModes<DuelsModes>([
  ...GetMetadataModes(Duels),

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

export * from "./mode";
