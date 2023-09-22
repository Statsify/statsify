/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Field } from "#metadata";
import { GameModes, type IGameModes } from "#game";
import { MegaWallsKit, MegaWallsOverall } from "./kit.js";
import type { APIData } from "@statsify/util";

export const MEGAWALLS_MODES = new GameModes([
  { api: "overall" },
  { api: "arcanist" },
  { api: "assassin" },
  { api: "automaton" },
  { api: "blaze" },
  { api: "cow" },
  { api: "creeper" },
  { api: "dreadlord" },
  { api: "enderman" },
  { api: "golem" },
  { api: "herobrine" },
  { api: "hunter" },
  { api: "moleman" },
  { api: "phoenix" },
  { api: "pigman" },
  { api: "pirate" },
  { api: "renegade" },
  { api: "shaman" },
  { api: "shark" },
  { api: "skeleton" },
  { api: "snowman" },
  { api: "spider" },
  { api: "squid" },
  { api: "werewolf" },
  { api: "zombie" },
]);

export type MegaWallsModes = IGameModes<typeof MEGAWALLS_MODES>;

export class MegaWalls {
  @Field({ historical: { enabled: false } })
  public coins: number;

  @Field({ historical: { enabled: false } })
  public mythicFavor: number;

  @Field({ store: { default: "none" } })
  public class: string;

  @Field()
  public overall: MegaWallsOverall;

  @Field({ store: { required: false } })
  public arcanist: MegaWallsKit;

  @Field({ store: { required: false } })
  public assassin: MegaWallsKit;

  @Field({ store: { required: false } })
  public automaton: MegaWallsKit;

  @Field({ store: { required: false } })
  public blaze: MegaWallsKit;

  @Field({ store: { required: false } })
  public cow: MegaWallsKit;

  @Field({ store: { required: false } })
  public creeper: MegaWallsKit;

  @Field({ store: { required: false } })
  public dreadlord: MegaWallsKit;

  @Field({ store: { required: false } })
  public enderman: MegaWallsKit;

  @Field({ store: { required: false } })
  public golem: MegaWallsKit;

  @Field({ store: { required: false } })
  public herobrine: MegaWallsKit;

  @Field({ store: { required: false } })
  public hunter: MegaWallsKit;

  @Field({ store: { required: false } })
  public moleman: MegaWallsKit;

  @Field({ store: { required: false } })
  public phoenix: MegaWallsKit;

  @Field({ store: { required: false } })
  public pigman: MegaWallsKit;

  @Field({ store: { required: false } })
  public pirate: MegaWallsKit;

  @Field({ store: { required: false } })
  public renegade: MegaWallsKit;

  @Field({ store: { required: false } })
  public shaman: MegaWallsKit;

  @Field({ store: { required: false } })
  public shark: MegaWallsKit;

  @Field({ store: { required: false } })
  public skeleton: MegaWallsKit;

  @Field({ store: { required: false } })
  public snowman: MegaWallsKit;

  @Field({ store: { required: false } })
  public spider: MegaWallsKit;

  @Field({ store: { required: false } })
  public squid: MegaWallsKit;

  @Field({ store: { required: false } })
  public werewolf: MegaWallsKit;

  @Field({ store: { required: false } })
  public zombie: MegaWallsKit;

  public constructor(data: APIData) {
    this.coins = data.coins;
    this.mythicFavor = data.mythic_favor;
    this.class = data.chosen_class ?? "none";

    this.overall = new MegaWallsOverall(data);
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

export * from "./kit.js";
