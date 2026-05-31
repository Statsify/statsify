/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  BlockingDead,
  BountyHunters,
  CreeperAttack,
  Disasters,
  DragonWars,
  Dropper,
  EnderSpleef,
  FarmHunt,
  Football,
  GalaxyWars,
  HideAndSeek,
  HoleInTheWall,
  HypixelSays,
  MiniWalls,
  PartyGames,
  PixelPainters,
  PixelParty,
  Seasonal,
  ThrowOut,
  Zombies,
} from "./mode.js";
import { type ExtractGameModes, GameModes } from "#game";
import { Field } from "#metadata";
import { add } from "@statsify/math";
import type { APIData } from "@statsify/util";

export const ARCADE_MODES = new GameModes([
  {
    api: "overall",
    aliases: ["arcade"],
    description: "commands.options.arcade.overall",
    emoji: "emojis:arcade.overall",
  },
  {
    api: "blockingDead",
    hypixel: "DAYONE",
    aliases: ["bd"],
    description: "commands.options.arcade.blockingDead",
    emoji: "emojis:arcade.blockingDead",
  },
  {
    api: "bountyHunters",
    hypixel: "ONEINTHEQUIVER",
    aliases: ["bh", "oitq"],
    description: "commands.options.arcade.bountyHunters",
    emoji: "emojis:arcade.bountyHunters",
  },
  {
    api: "creeperAttack",
    hypixel: "DEFENDER",
    aliases: ["ca"],
    description: "commands.options.arcade.creeperAttack",
    emoji: "emojis:arcade.creeperAttack",
  },
  {
    api: "disasters",
    hypixel: "DISASTERS",
    aliases: [],
    description: "commands.options.arcade.disasters",
    emoji: "emojis:arcade.disasters",
    submodes: [
      {
        api: "overall",
        aliases: [],
        description: "commands.options.arcade.submodes.overall",
      },
      {
        api: "survivals",
        aliases: ["surv"],
        description: "commands.options.arcade.submodes.survivals",
      },
      {
        api: "deaths",
        aliases: [],
        description: "commands.options.arcade.submodes.deaths",
      },
    ],
  },
  {
    api: "dragonWars",
    hypixel: "DRAGONWARS2",
    aliases: ["dw"],
    description: "commands.options.arcade.dragonWars",
    emoji: "emojis:arcade.dragonWars",
  },
  {
    api: "dropper",
    hypixel: "DROPPER",
    aliases: [],
    description: "commands.options.arcade.dropper",
    emoji: "emojis:arcade.dropper",
    submodes: [
      {
        api: "overall",
        aliases: [],
        description: "commands.options.arcade.submodes.overall",
      },
      {
        api: "bestTimes",
        aliases: ["times"],
        description: "commands.options.arcade.submodes.bestTimes",
      },
      {
        api: "completions",
        aliases: ["comps"],
        description: "commands.options.arcade.submodes.completions",
      },
    ],
  },
  {
    api: "enderSpleef",
    hypixel: "ENDER",
    aliases: ["es"],
    description: "commands.options.arcade.enderSpleef",
    emoji: "emojis:arcade.enderSpleef",
  },
  {
    api: "farmHunt",
    hypixel: "FARM_HUNT",
    aliases: ["fh"],
    description: "commands.options.arcade.farmHunt",
    emoji: "emojis:arcade.farmHunt",
  },
  {
    api: "football",
    hypixel: "SOCCER",
    aliases: ["soccer"],
    description: "commands.options.arcade.football",
    emoji: "emojis:arcade.football",
  },
  {
    api: "galaxyWars",
    hypixel: "STARWARS",
    aliases: ["gw", "starwars"],
    description: "commands.options.arcade.galaxyWars",
    emoji: "emojis:arcade.galaxyWars",
  },
  {
    api: "hideAndSeek",
    aliases: ["hns"],
    description: "commands.options.arcade.hideAndSeek",
    emoji: "emojis:arcade.hideAndSeek",
  },
  {
    api: "holeInTheWall",
    hypixel: "HOLE_IN_THE_WALL",
    aliases: ["hitw"],
    description: "commands.options.arcade.holeInTheWall",
    emoji: "emojis:arcade.holeInTheWall",
  },
  {
    api: "hypixelSays",
    hypixel: "SIMON_SAYS",
    aliases: ["simonSays", "hs"],
    description: "commands.options.arcade.hypixelSays",
    emoji: "emojis:arcade.hypixelSays",
  },
  {
    api: "miniWalls",
    hypixel: "MINI_WALLS",
    aliases: ["mw"],
    description: "commands.options.arcade.miniWalls",
    emoji: "emojis:arcade.miniWalls",
  },
  {
    api: "partyGames",
    hypixel: "PARTY",
    aliases: ["pg"],
    description: "commands.options.arcade.partyGames",
    emoji: "emojis:arcade.partyGames",
    submodes: [
      {
        api: "overall",
        aliases: [],
        description: "commands.options.arcade.submodes.overall",
      },
      {
        api: "roundWins",
        aliases: ["rounds"],
        description: "commands.options.arcade.submodes.roundWins",
      },
    ],
  },
  {
    api: "pixelPainters",
    hypixel: "DRAW_THEIR_THING",
    aliases: ["ppaint"],
    description: "commands.options.arcade.pixelPainters",
    emoji: "emojis:arcade.pixelPainters",
  },
  {
    api: "pixelParty",
    hypixel: "PIXEL_PARTY",
    aliases: ["pp"],
    description: "commands.options.arcade.pixelParty",
    emoji: "emojis:arcade.pixelParty",
  },
  {
    api: "seasonal",
    aliases: [],
    description: "commands.options.arcade.seasonal",
    emoji: "emojis:arcade.seasonal",
  },
  {
    api: "throwOut",
    hypixel: "THROW_OUT",
    aliases: ["to"],
    description: "commands.options.arcade.throwOut",
    emoji: "emojis:arcade.throwOut",
  },
  {
    api: "zombies",
    aliases: ["zb"],
    description: "commands.options.arcade.zombies",
    emoji: "emojis:arcade.zombies",
    submodes: [
      {
        api: "overall",
        aliases: [],
        description: "commands.options.arcade.submodes.zombies.overall",
        emoji: "emojis:zombies.overall",
      },
      {
        api: "deadEnd",
        aliases: ["de"],
        description: "commands.options.arcade.submodes.zombies.deadEnd",
        emoji: "emojis:zombies.deadEnd",
      },
      {
        api: "badBlood",
        aliases: ["bb"],
        description: "commands.options.arcade.submodes.zombies.badBlood",
        emoji: "emojis:zombies.badBlood",
      },
      {
        api: "alienArcadium",
        aliases: ["aa"],
        description: "commands.options.arcade.submodes.zombies.alienArcadium",
        emoji: "emojis:zombies.alienArcadium",
      },
      {
        api: "prison",
        aliases: [],
        description: "commands.options.arcade.submodes.zombies.prison",
        emoji: "emojis:zombies.prison",
      },
    ],
  },

  {
    hypixel: "HIDE_AND_SEEK_PARTY_POOPER",
    formatted: "Hide and Seek Party Pooper",
  },
  { hypixel: "HIDE_AND_SEEK_PROP_HUNT", formatted: " Hide and Seek Prop Hunt" },
] as const);

export type ArcadeModes = ExtractGameModes<typeof ARCADE_MODES>;

export class Arcade {
  @Field({ historical: { enabled: false } })
  public coins: number;

  @Field()
  public wins: number;

  @Field()
  public coinConversions: number;

  @Field()
  public blockingDead: BlockingDead;

  @Field()
  public bountyHunters: BountyHunters;

  @Field()
  public creeperAttack: CreeperAttack;

  @Field()
  public disasters: Disasters;

  @Field()
  public dragonWars: DragonWars;

  @Field()
  public dropper: Dropper;

  @Field()
  public enderSpleef: EnderSpleef;

  @Field()
  public farmHunt: FarmHunt;

  @Field()
  public football: Football;

  @Field()
  public galaxyWars: GalaxyWars;

  @Field()
  public hideAndSeek: HideAndSeek;

  @Field()
  public holeInTheWall: HoleInTheWall;

  @Field()
  public hypixelSays: HypixelSays;

  @Field()
  public miniWalls: MiniWalls;

  @Field()
  public partyGames: PartyGames;

  @Field()
  public pixelPainters: PixelPainters;

  @Field()
  public pixelParty: PixelParty;

  @Field()
  public seasonal: Seasonal;

  @Field()
  public throwOut: ThrowOut;

  @Field()
  public zombies: Zombies;

  public constructor(data: APIData, ap: APIData) {
    this.coins = data.coins;
    this.coinConversions = data.stamp_level;

    this.blockingDead = new BlockingDead(data);
    this.bountyHunters = new BountyHunters(data);
    this.creeperAttack = new CreeperAttack(data);
    this.disasters = new Disasters(data?.disasters?.stats, ap);
    this.dragonWars = new DragonWars(data, ap);
    this.dropper = new Dropper(data?.dropper);
    this.enderSpleef = new EnderSpleef(data);
    this.farmHunt = new FarmHunt(data);
    this.football = new Football(data);
    this.galaxyWars = new GalaxyWars(data);
    this.hideAndSeek = new HideAndSeek(data, ap);
    this.holeInTheWall = new HoleInTheWall(data);
    this.hypixelSays = new HypixelSays(data);
    this.miniWalls = new MiniWalls(data);
    this.partyGames = new PartyGames(data);
    this.pixelPainters = new PixelPainters(data);
    this.pixelParty = new PixelParty(data);
    this.seasonal = new Seasonal(data);
    this.throwOut = new ThrowOut(data);
    this.zombies = new Zombies(data);

    this.wins = add(
      this.blockingDead.wins,
      this.bountyHunters.wins,
      this.disasters.wins,
      this.dragonWars.wins,
      this.dropper.wins,
      this.enderSpleef.wins,
      this.farmHunt.wins,
      this.football.wins,
      this.galaxyWars.wins,
      this.hideAndSeek.overall.wins,
      this.holeInTheWall.wins,
      this.hypixelSays.wins,
      this.miniWalls.wins,
      this.partyGames.wins,
      this.pixelPainters.wins,
      this.pixelParty.overall.wins,
      this.seasonal.totalWins,
      this.throwOut.wins,
      this.zombies.overall.wins
    );
  }
}

export * from "./mode.js";
export * from "./seasonal-mode.js";
