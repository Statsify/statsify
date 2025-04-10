/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Player } from "@statsify/schemas";
import { BingoPage } from "./bingo";

async function getPlayer(slug: string) {
  const response = await fetch(`http://localhost:3000/player?key=${process.env.API_KEY}&player=${slug}`);
  const { player } = await response.json();
  return player;
}

export default async function TestPage() {
  // const player = await getPlayer("Yann31_");
  const player: Player = {
    displayName: "test",
    stats: {
      general: {
        bingo: {
          easy: {
            casual: {
              goldenSun: 1,
              robinHood: 1,
              ifYouGiveAHouseACookie: 1,
              fallinPastTheFall: 1,
              homeRun: 1,
              podiumPosition: 1,
              intermediateEggHunter: 1,
              doomsdayPrep: 1,
              iSurvivedAnniversaryBingo: 1,
              aintNoTNTTag: 1,
              intoTheLabyrinth: 1,
              notQuiteADeadEnd: 1,
              aPerfectMedium: 1,
              theThing: 1,
              oneWithTheFish: 1,
              festiveSpirit: 1,
            },
            classic: {
              bloodthirsty: 1,
              tooStronk: 1,
              sunnyDelight: 1,
              luckyLooter: 1,
              revelingInTheSun: 1,
              amateurWizard: 1,
              notEnoughToGoAround: 1,
              defusalVictor: 1,
              ninjaVanish: 1,
              quenchy: 1,
              shutdown: 1,
              slowingThemDown: 1,
              witheringHeights: 1,
              handOfTheKing: 1,
              longNight: 1,
              threeTimesTheFun: 1,
            },
            pvp: {
              treasureHunter: 1,
              multifacetedKiller: 1,
              sumoVictor: 1,
              aLongWayDown: 1,
              ironWall: 1,
              swiftOfFoot: 1,
              classicVictor: 1,
              funWithFriends: 1,
              suitUp: 1,
              woolThatKills: 1,
              crushingVictory: 1,
              bedDestroyer: 1,
              greenEyedMonster: 1,
              littleShopOfTraps: 1,
              infestation: 1,
              andStayDown: 1,
            },
          },
          hard: {
            casual: {
              fastANDAccurate: 0,
              scaryGood: 200,
              lightningFast: 1,
              freakyFalling: 1,
              masterEggHunter: 1,
              grandSlam: 1,
              springParty: 1,
              vacationFunds: 1,
              caughtInTheAct: 1,
              canTCatchMe: 1,
              infectiousFun: 1,
              untouchable2: 1,
              untouchable1: 1,
              junkHoarder: 1,
              safeAndSound: 1,
              slayinThroughTheEnd: 1,
            },
            classic: {
              unlimitedPower: 1,
              fromRichesToRags: 1,
              deadlyDrifting: 1,
              landslideVictory: 1,
              undeath: 1,
              anExerciseInRestraint: 1,
              oneStepAbove: 1,
              whatDoesTheRedWireDo: 1,
              unassailable: 1,
              aLoudSilence: 1,
              multifaceted: 1,
              oneLastChallenge: 1,
              notSoClose: 1,
              catchMeIfYouCan: 1,
              snowbodySSafe: 1,
              sharpenedDiamond: 1,
            },
            pvp: {
              cabinetOfSouls: 1,
              anOffering: 1,
              betterNerfThis: 1,
              funInTheSun: 1,
              renaissanceKiller: 1,
              hardcoreChampion: 1,
              cleanSheet: 1,
              headInTheClouds: 1,
              giveThatBack: 1,
              notAChance: 1,
              technicolorMurder: 1,
              immortal: 1,
              partySOver: 1,
              oneForAll: 1,
              cantStopTheCelebrations: 1,
              finalDestination: 1,
            },
          },
        },
      },
    },
  };

  return <BingoPage player={player} />;
}
