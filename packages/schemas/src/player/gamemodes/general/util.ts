/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { APIData } from "@statsify/util";
import { roundTo } from "@statsify/math";

export const getChallenges = ({ all_time: allTime = {} }: APIData = {}) => {
  let challenges = 0;

  Object.values(allTime).forEach((challenge) => {
    challenges += challenge as number;
  });

  return challenges;
};

export const getNetworkExp = (networkLevel = 1) =>
  (Math.pow((networkLevel + 2.5) * 50, 2) - 30_625) / 2;

export const getNetworkLevel = (networkExp = 0) =>
  networkExp ? roundTo(Math.sqrt(networkExp * 2 + 30_625) / 50 - 2.5) : 1;

export const getQuests = (questData: APIData = {}) => {
  let quests = 0;

  Object.keys(questData).forEach((quest) => {
    if (Object.prototype.hasOwnProperty.call(questData[quest], "completions")) {
      questData[quest].completions.forEach(() => {
        quests += 1;
      });
    }
  });

  return quests;
};
