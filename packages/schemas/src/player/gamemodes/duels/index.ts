/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  BlitzSGDuels,
  BridgeDuels,
  MultiPVPDuelsGameMode,
  SingleBowDuelsGameMode,
  SingleBowPVPDuelsGameMode,
  SingleDuelsGameMode,
  SinglePVPDuelsGameMode,
  SkyWarsDuels,
  UHCDuels,
} from "./mode.js";
import { Field } from "#metadata";
import { GameModes, type IGameModes } from "#game";
import type { APIData } from "@statsify/util";

export const DUELS_MODES = new GameModes([
  { api: "overall" },
  { api: "arena", hypixel: "DUELS_DUEL_ARENA" },
  { api: "blitzsg", hypixel: "DUELS_BLITZ_DUEL", formatted: "BlitzSG" },
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

export const BRIDGE_MODES = new GameModes([
  { api: "overall" },
  { api: "solo" },
  { api: "doubles" },
  { api: "threes" },
  { api: "fours" },
  { api: "2v2v2v2" },
  { api: "3v3v3v3" },
  { api: "ctf", formatted: "CTF" },
]);

export type BridgeModes = IGameModes<typeof BRIDGE_MODES>;

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
  public arena: SingleBowDuelsGameMode;

  @Field({
    leaderboard: {
      fieldName: "BlitzSG",
      extraDisplay: "this.blitzsg.titleFormatted",
    },
  })
  public blitzsg: BlitzSGDuels;

  @Field({ leaderboard: { extraDisplay: "this.bow.titleFormatted" } })
  public bow: SingleBowPVPDuelsGameMode;

  @Field({ leaderboard: { extraDisplay: "this.bowSpleef.titleFormatted" } })
  public bowSpleef: SingleBowDuelsGameMode;

  @Field({ leaderboard: { extraDisplay: "this.boxing.titleFormatted" } })
  public boxing: SinglePVPDuelsGameMode;

  @Field({ leaderboard: { extraDisplay: "this.bridge.titleFormatted" } })
  public bridge: BridgeDuels;

  @Field({ leaderboard: { extraDisplay: "this.classic.titleFormatted" } })
  public classic: SingleBowPVPDuelsGameMode;

  @Field({ leaderboard: { extraDisplay: "this.combo.titleFormatted" } })
  public combo: SinglePVPDuelsGameMode;

  @Field({
    leaderboard: {
      fieldName: "MegaWalls",
      extraDisplay: "this.megawalls.titleFormatted",
    },
  })
  public megawalls: MultiPVPDuelsGameMode;

  @Field({
    leaderboard: {
      fieldName: "NoDebuff",
      extraDisplay: "this.nodebuff.titleFormatted",
    },
  })
  public nodebuff: SinglePVPDuelsGameMode;

  @Field({
    leaderboard: { fieldName: "OP", extraDisplay: "this.op.titleFormatted" },
  })
  public op: MultiPVPDuelsGameMode;

  @Field({ leaderboard: { extraDisplay: "this.parkour.titleFormatted" } })
  public parkour: SingleDuelsGameMode;

  @Field({
    leaderboard: {
      fieldName: "SkyWars",
      extraDisplay: "this.skywars.titleFormatted",
    },
  })
  public skywars: SkyWarsDuels;

  @Field({ leaderboard: { extraDisplay: "this.sumo.titleFormatted" } })
  public sumo: SinglePVPDuelsGameMode;

  @Field({
    leaderboard: { fieldName: "UHC", extraDisplay: "this.uhc.titleFormatted" },
  })
  public uhc: UHCDuels;

  public constructor(data: APIData) {
    this.overall = new SingleBowPVPDuelsGameMode(data, "", "");
    this.arena = new SingleBowDuelsGameMode(data, "Arena", "duel_arena");

    this.blitzsg = new BlitzSGDuels(data);
    this.bow = new SingleBowPVPDuelsGameMode(data, "Bow", "bow_duel");
    this.bowSpleef = new SingleBowDuelsGameMode(data, "TNT", "bowspleef_duel");
    this.boxing = new SinglePVPDuelsGameMode(data, "Boxing", "boxing_duel");

    this.bridge = new BridgeDuels(data);
    this.classic = new SingleBowPVPDuelsGameMode(data, "Classic", "classic_duel");
    this.combo = new SinglePVPDuelsGameMode(data, "Combo", "combo_duel");
    this.megawalls = new MultiPVPDuelsGameMode(data, "MW", "mw", "mega_walls");
    this.nodebuff = new SinglePVPDuelsGameMode(data, "NoDebuff", "potion_duel");
    this.op = new MultiPVPDuelsGameMode(data, "OP", "op", "op");

    this.parkour = new SingleDuelsGameMode(data, "Parkour", "parkour_eight");
    this.skywars = new SkyWarsDuels(data);
    this.sumo = new SinglePVPDuelsGameMode(data, "Sumo", "sumo_duel");
    this.uhc = new UHCDuels(data);

    this.pingRange = data?.pingPreference ?? 300;
    this.tokens = data.coins;
  }
}

export * from "./mode.js";
