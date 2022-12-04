/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { APIData } from "@statsify/util";
import { Field } from "../../../metadata";
import { GameModes } from "../../../game";
import {
  GameType,
  GetMetadataModes,
  Mode,
  StatsifyApiModes,
} from "../../../metadata/GameType";
import { MegaWallsKit, MegaWallsOverall } from "./kit";

@GameType()
export class MegaWalls {
  @Field()
  public coins: number;

  @Field()
  public mythicFavor: number;

  @Field({ store: { default: "none" } })
  public class: string;

  @Mode()
  @Field()
  public overall: MegaWallsOverall;

  @Mode()
  @Field({ store: { required: false } })
  public arcanist: MegaWallsKit;

  @Mode()
  @Field({ store: { required: false } })
  public assassin: MegaWallsKit;

  @Mode()
  @Field({ store: { required: false } })
  public automaton: MegaWallsKit;

  @Mode()
  @Field({ store: { required: false } })
  public blaze: MegaWallsKit;

  @Mode()
  @Field({ store: { required: false } })
  public cow: MegaWallsKit;

  @Mode()
  @Field({ store: { required: false } })
  public creeper: MegaWallsKit;

  @Mode()
  @Field({ store: { required: false } })
  public dreadlord: MegaWallsKit;

  @Mode()
  @Field({ store: { required: false } })
  public enderman: MegaWallsKit;

  @Mode()
  @Field({ store: { required: false } })
  public golem: MegaWallsKit;

  @Mode()
  @Field({ store: { required: false } })
  public herobrine: MegaWallsKit;

  @Mode()
  @Field({ store: { required: false } })
  public hunter: MegaWallsKit;

  @Mode()
  @Field({ store: { required: false } })
  public moleman: MegaWallsKit;

  @Mode()
  @Field({ store: { required: false } })
  public phoenix: MegaWallsKit;

  @Mode()
  @Field({ store: { required: false } })
  public pigman: MegaWallsKit;

  @Mode()
  @Field({ store: { required: false } })
  public pirate: MegaWallsKit;

  @Mode()
  @Field({ store: { required: false } })
  public renegade: MegaWallsKit;

  @Mode()
  @Field({ store: { required: false } })
  public shaman: MegaWallsKit;

  @Mode()
  @Field({ store: { required: false } })
  public shark: MegaWallsKit;

  @Mode()
  @Field({ store: { required: false } })
  public skeleton: MegaWallsKit;

  @Mode()
  @Field({ store: { required: false } })
  public snowman: MegaWallsKit;

  @Mode()
  @Field({ store: { required: false } })
  public spider: MegaWallsKit;

  @Mode()
  @Field({ store: { required: false } })
  public squid: MegaWallsKit;

  @Mode()
  @Field({ store: { required: false } })
  public werewolf: MegaWallsKit;

  @Mode()
  @Field({ store: { required: false } })
  public zombie: MegaWallsKit;

  public constructor(data: APIData) {
    this.coins = data.coins;
    this.mythicFavor = data.mythic_favor;
    this.class = data.chosen_class ?? "none";

    this.overall = new MegaWallsOverall(data, "");
    this.arcanist = new MegaWallsKit(data, "arcanist");
    this.assassin = new MegaWallsKit(data, "assassin");
    this.automaton = new MegaWallsKit(data, "automaton");
    this.blaze = new MegaWallsKit(data, "blaze");
    this.cow = new MegaWallsKit(data, "cow");
    this.creeper = new MegaWallsKit(data, "creeper");
    this.dreadlord = new MegaWallsKit(data, "dreadlord");
    this.enderman = new MegaWallsKit(data, "enderman");
    this.golem = new MegaWallsKit(data, "golem");
    this.herobrine = new MegaWallsKit(data, "herobrine");
    this.hunter = new MegaWallsKit(data, "hunter");
    this.moleman = new MegaWallsKit(data, "moleman");
    this.phoenix = new MegaWallsKit(data, "phoenix");
    this.pigman = new MegaWallsKit(data, "pigman");
    this.pirate = new MegaWallsKit(data, "pirate");
    this.renegade = new MegaWallsKit(data, "renegade");
    this.shaman = new MegaWallsKit(data, "shaman");
    this.shark = new MegaWallsKit(data, "shark");
    this.skeleton = new MegaWallsKit(data, "skeleton");
    this.snowman = new MegaWallsKit(data, "snowman");
    this.spider = new MegaWallsKit(data, "spider");
    this.squid = new MegaWallsKit(data, "squid");
    this.werewolf = new MegaWallsKit(data, "werewolf");
    this.zombie = new MegaWallsKit(data, "zombie");
  }
}

export type MegaWallsModes = StatsifyApiModes<MegaWalls>;
export const MEGAWALLS_MODES = new GameModes<MegaWallsModes>(GetMetadataModes(MegaWalls));

export * from "./kit";
