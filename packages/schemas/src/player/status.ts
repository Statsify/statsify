/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Field } from "#metadata";
import { Game } from "#game";
import type { APIData } from "@statsify/util";

function findLastAction(data: APIData): { action: string; time: number } {
  const actions: { action: string; time: number }[] = [];

  const allQuests = data?.quests ?? {};

  let lastQuestEnd = 0;
  let lastQuestStart = 0;

  for (const questName in allQuests) {
    const quest = allQuests[questName];

    if (quest.active && quest.active.started > lastQuestStart) {
      lastQuestStart = quest.active.started;
    }

    if (quest.completions?.length && quest.completions.at(-1)?.time > lastQuestEnd) {
      lastQuestEnd = quest.completions.at(-1).time;
    }
  }

  actions.push({ action: "QUEST_START", time: lastQuestStart }, { action: "QUEST_COMPLETED", time: lastQuestEnd });

  const allPets = data?.petStats ?? {};

  let lastPetTime = 0;

  for (const petName in allPets) {
    const pet = allPets[petName];

    const thisPetTime = Math.max(
      pet?.THIRST?.timestamp ?? 0,
      pet?.EXERCISE?.timestamp ?? 0,
      pet?.HUNGER?.timestamp ?? 0
    );

    if (thisPetTime > lastPetTime) {
      lastPetTime = thisPetTime;
    }
  }

  // It really is not necessary to display which pet action was last done
  // Therefore just putting pet is explanation enough to the players last
  // known whereabouts.
  actions.push({ action: "PET", time: lastPetTime }, {
    action: "PET_JOURNEY",
    time: data?.petJourneyTimestamp ?? 0,
  });

  if (data?.stats?.SkyWars) {
    // Lab modes are explained each first time any player enters the game
    // as well as when they click the book while in queue.
    const explains = Object.entries(data?.stats?.SkyWars).filter(e =>
      e[0].endsWith("explained_last")
    );

    if (explains.length > 0) {
      const lastLabExplain = Math.max(...explains.map(e => e[1] as number));
      actions.push({ action: "SW_LAB_MODE_EXPLANATION", time: lastLabExplain });
    }

    // Every collection of a player head in skywars has a timestamp
    // this means that high level players with status off will show
    // relatively accurate times if they play skywars.
    const swHeads = data?.stats?.SkyWars?.head_collection ?? {};

    if (swHeads.recent) {
      actions.push({
        action: "SW_HEAD_RECENT",
        time: swHeads.recent?.[swHeads.recent.length - 1]?.time ?? 0,
      });
    }

    if (swHeads.prestigious) {
      actions.push({
        action: "SW_HEAD_PRESTIGIOUS",
        time: swHeads.prestigious?.[swHeads.prestigious.length - 1]?.time ?? 0,
      });
    }
  }

  if (data?.stats?.Pit?.profile) {
    const pitProfile = data?.stats?.Pit?.profile;

    // Pit profile saves are any stat changing, this makes other actions redundant
    // but they do show a little bit more info as to what the player is doing.
    actions.push(
      {
        action: "PIT_PROFILE_SAVE",
        time: pitProfile.last_save ?? 0,
      },
      {
        action: "PIT_MIDFIGHT_DISCONNECT",
        time: pitProfile.last_midfight_disconnect ?? 0,
      },
      {
        action: "PIT_CONTRACT",
        time: pitProfile.last_contract ?? 0,
      },
      {
        action: "PIT_TRADE",
        time: Math.max(...(pitProfile.trade_timestamps ?? [0])),
      }
    );
  }

  // A large number of players do claim these each day, this means
  // it will yield accurate results to within a day on most people
  actions.push(
    {
      action: "CLAIM_DAILY_EXP",
      time: data?.eugene?.dailyTwoKExp ?? 0,
    },
    {
      action: "CLAIM_REWARD",
      time: data?.lastClaimedReward ?? 0,
    },
    {
      action: "LOGIN",
      time: data?.lastLogin ?? 0,
    },
    {
      action: "LOGOUT",
      time: data?.lastLogout ?? 0,
    }
  );

  // This is good for tracking ap hunters who are playing games with very
  // little in the way of time stats in the game they are playing.
  if (data?.achievementRewardsNew) {
    const rewardsArr: number[] = Object.values(data?.achievementRewardsNew ?? {});
    actions.push({ action: "ACHIEVEMENT_REWARD", time: Math.max(...rewardsArr) });
  }

  // Many people who just wait in lobbies will be shown on this stat since they
  // will most likely touch the parkour at some point.
  if (data.parkourCompletions) {
    const lobbies = Object.values(data.parkourCompletions);

    const starts = lobbies.map((l: any) => l[0].timeStart);
    actions.push({ action: "LOBBY_PARKOUR", time: Math.max(...starts) });
  }

  if (data.stats) {
    const games = Object.values(data.stats);
    const tourneyAds = games.map((g: any) => g.lastTourneyAd).filter(v => !!v);
    actions.push({ action: "TOURNAMENT_ADVERTISEMENT", time: Math.max(...tourneyAds) });
  }

  // First login is used as a baseline due to it being literally the oldest timestamp
  // that can be found in a players stats.
  let lastAction = { action: "FIRST_LOGIN", time: data?.firstLogin ?? 0 };

  for (const action of actions) {
    if (action.time > lastAction.time) {
      lastAction = action;
    }
  }

  return lastAction;
}

export class PlayerStatus {
  @Field({ leaderboard: { enabled: false } })
  public firstLogin: number;

  @Field()
  public lastAction: string;

  @Field({ leaderboard: { enabled: false } })
  public lastActionTime: number;

  @Field({ leaderboard: { enabled: false } })
  public lastLogin: number;

  @Field({ leaderboard: { enabled: false } })
  public lastLogout: number;

  @Field()
  public online: boolean;

  @Field()
  public statusHidden: boolean;

  @Field({ store: { default: "Unknown" } })
  public version: string;

  @Field()
  public lastGame: Game;

  public constructor(data: APIData) {
    // The first login provided by hypixel is not fully accurate for very old players, it is better to use the `_id` field
    this.firstLogin = Number.parseInt(data._id?.slice(0, 8) ?? 0, 16) * 1000;

    const lastAction = findLastAction(data);

    this.lastAction = lastAction.action;
    this.lastActionTime = lastAction.time;

    this.lastLogin = data.lastLogin ?? 0;
    this.lastLogout = data.lastLogout ?? 0;
    this.online = this.lastLogin > this.lastLogout;

    this.statusHidden = this.lastLogout === 0;

    this.version = data.mcVersionRp ?? "Unknown";

    this.lastGame = new Game(data.mostRecentGameType ?? "LIMBO");
  }
}
