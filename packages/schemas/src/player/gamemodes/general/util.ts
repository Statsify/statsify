/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { roundTo } from '@statsify/math';
import { APIData } from '@statsify/util';

export class GeneralUtil {
  public static getChallenges({ all_time: allTime = {} }: APIData = {}) {
    let challenges = 0;

    Object.values(allTime).forEach((challenge) => {
      challenges += challenge as number;
    });

    return challenges;
  }
  public static getNetworkExp(networkLevel = 1) {
    return (Math.pow((networkLevel + 2.5) * 50, 2) - 30625) / 2;
  }

  public static getNetworkLevel(networkExp = 0) {
    return networkExp ? roundTo(Math.sqrt(networkExp * 2 + 30625) / 50 - 2.5) : 1;
  }

  public static getQuests(questData: APIData = {}) {
    let quests = 0;

    Object.keys(questData).forEach((quest) => {
      if (Object.prototype.hasOwnProperty.call(questData[quest], 'completions')) {
        questData[quest].completions.forEach(() => {
          quests += 1;
        });
      }
    });

    return quests;
  }
}
