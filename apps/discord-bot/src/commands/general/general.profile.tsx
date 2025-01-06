/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Container, Footer, Header, If, Table } from "#components";
import { DateTime } from "luxon";
import { FormattedGame, Guild, PlayerStats, PlayerStatus } from "@statsify/schemas";
import { LocalizeFunction } from "@statsify/discord";
import { arcadeWins } from "#commands/arcade/wins";
import type { BaseProfileProps } from "#commands/base.hypixel-command";

interface GeneralProfileHeaderBodyProps {
  guild?: Guild;
  status: PlayerStatus;
  t: LocalizeFunction;
}

const GeneralProfileHeaderBody = ({
  guild,
  status,
  t,
}: GeneralProfileHeaderBodyProps) => {
  const online = status.online ? `§a${t("stats.online")}` : `§c${t("stats.offline")}`;

  const format = "LL/dd/yy',' hh:mm a";
  const firstLogin = DateTime.fromMillis(status.firstLogin).toFormat(format, {
    locale: t.locale,
  });

  const lastLogin = status.lastLogin ?
    DateTime.fromMillis(status.lastLogin).toFormat(format, { locale: t.locale }) :
    "N/A";

  return (
    <div height="remaining" width="remaining" direction="row">
      <div width="remaining" height="100%" direction="column">
        <box width="100%" height="50%">
          <text>
            §7{t("stats.guild.guild")}: §2{guild?.name ?? "N/A"}
          </text>
        </box>
        <box width="100%" height="50%">
          <text>
            §7{t("stats.status")}: {online}
          </text>
        </box>
      </div>
      <box height="100%" direction="column">
        <text align="left">
          §7{t("stats.firstLogin")}: §3{firstLogin}
        </text>
        <text align="left">
          §7{t("stats.lastLogin")}: §3{lastLogin}
        </text>
      </box>
    </div>
  );
};

export interface GeneralProfileProps extends BaseProfileProps {
  guild?: Guild;
}

export const GeneralProfile = ({
  background,
  logo,
  player,
  skin,
  t,
  badge,
  user,
  guild,
  time,
}: GeneralProfileProps) => {
  const { general, challenges, quests } = player.stats;
  const { status } = player;
  const member = guild?.members.find((m) => m.uuid === player.uuid);

  const mostPlayedGame = findMostPlayedGame(player.stats);

  return (
    <Container background={background}>
      <Header
        name={`${player.displayName}§^2^${guild?.tag ? ` ${guild.tagFormatted}` : ""}`}
        skin={skin}
        badge={badge}
        size={3}
        title={`§l${FormattedGame.GENERAL} Stats`}
        time={time}
      >
        <GeneralProfileHeaderBody guild={guild} status={status} t={t} />
      </Header>
      <Table.table>
        <Table.tr>
          <Table.td
            title={t("stats.networkLevel")}
            value={t(general.networkLevel)}
            color="§6"
          />
          <Table.td
            title={t("stats.achievementPoints")}
            value={t(general.achievementPoints)}
            color="§6"
          />
        </Table.tr>
        <Table.tr>
          <Table.td title={t("stats.quests")} value={t(quests.total)} color="§a" />
          <Table.td
            title={t("stats.challenges")}
            value={t(challenges.total)}
            color="§a"
          />
        </Table.tr>
        <Table.tr>
          <Table.td title={t("stats.karma")} value={t(general.karma)} color="§d" />
          <Table.td
            title={t("stats.rewardStreak")}
            value={t(general.currentRewardStreak)}
            color="§d"
          />
          <Table.td
            title={t("stats.ranksGifted")}
            value={t(general.ranksGifted)}
            color="§d"
          />
        </Table.tr>
        <Table.ts title={`§l${FormattedPlayableGame[mostPlayedGame]} §l§f${mostPlayedGame === "arcade" ? "Wins" : "Stats"}`}>
          <Table.tr>
            <GamePreviewTable game={mostPlayedGame} stats={player.stats} t={t} />
          </Table.tr>
        </Table.ts>
        <If condition={member}>
          {(member) => (
            <Table.ts title="§2Guild">
              <Table.tr>
                <Table.td
                  title={t("stats.guild.quests")}
                  value={t(member.questParticipation)}
                  color="§2"
                />
                <Table.td
                  title={t("stats.guild.daily-gexp")}
                  value={t(member.daily)}
                  color="§2"
                />
                <Table.td
                  title={t("stats.guild.weekly-gexp")}
                  value={t(member.weekly)}
                  color="§2"
                />
              </Table.tr>
            </Table.ts>
          )}
        </If>
      </Table.table>
      <Footer logo={logo} user={user} />
    </Container>
  );
};

function findMostPlayedGame(stats: PlayerStats): PlayableGame {
  const keys = Object.keys(stats) as Array<keyof PlayerStats>;
  const games = keys.filter((game) => game !== "parkour" && game !== "general" && game !== "quests" && game !== "challenges");
  const weights = games.map((game) => gameWeight(stats, game));

  let max = weights[0];
  let index = 0;

  for (const [i, weight] of weights.entries()) {
    if (weight > max) {
      index = i;
      max = weight;
    }
  }

  return games[index];
}

type PlayableGame = Exclude<keyof PlayerStats, "parkour" | "general" | "quests" | "challenges">;

function gameWeight(stats: PlayerStats, game: PlayableGame) {
  const [mean, stdev] = GameNormal[game];

  let score: number;

  switch (game) {
    case "arcade":
      score = stats.arcade.wins;
      break;

    case "arenabrawl":
      score = stats.arenabrawl.overall.wins;
      break;

    case "bedwars":
      score = stats.bedwars.overall.wins;
      break;

    case "blitzsg":
      score = stats.blitzsg.overall.wins;
      break;

    case "buildbattle":
      score = stats.buildbattle.overall.wins;
      break;

    case "copsandcrims":
      score = stats.copsandcrims.overall.wins;
      break;

    case "duels":
      score = stats.duels.overall.wins;
      break;

    case "megawalls":
      score = stats.megawalls.overall.wins;
      break;

    case "murdermystery":
      score = stats.murdermystery.overall.wins;
      break;

    case "paintball":
      score = stats.paintball.wins;
      break;

    case "pit":
      score = stats.pit.trueLevel;
      break;

    case "quake":
      score = stats.quake.overall.wins;
      break;

    case "skywars":
      score = stats.skywars.overall.wins;
      break;

    case "smashheroes":
      score = stats.smashheroes.overall.wins;
      break;

    case "speeduhc":
      score = stats.speeduhc.overall.wins;
      break;

    case "tntgames":
      score = stats.tntgames.wins;
      break;

    case "turbokartracers":
      score = stats.turbokartracers.gold + stats.turbokartracers.silver + stats.turbokartracers.bronze;
      break;

    case "uhc":
      score = stats.uhc.overall.wins;
      break;

    case "vampirez":
      score = stats.vampirez.wins;
      break;

    case "walls":
      score = stats.walls.wins;
      break;

    case "warlords":
      score = stats.warlords.wins;
      break;

    case "woolgames":
      score = stats.woolgames.wins;
      break;
  }

  return (score - mean) / stdev;
}

interface GamePreviewTableProps {
  game: PlayableGame;
  stats: PlayerStats;
  t: LocalizeFunction;
}

function GamePreviewTable({ game, stats, t }: GamePreviewTableProps) {
  switch (game) {
    case "arcade":{
      const [first, second, third] = arcadeWins(stats[game]);

      return (
        <>
          <Table.td
            title="Overall"
            value={t(stats[game].wins)}
            color="§a"
          />
          <Table.td
            title={first[0]}
            value={t(first[1])}
            color="§e"
          />
          <Table.td
            title={second[0]}
            value={t(second[1])}
            color="§6"
          />
          <Table.td
            title={third[0]}
            value={t(third[1])}
            color="§c"
          />
        </>
      );
    }
    case "arenabrawl":
      return (
        <>
          <Table.td
            title={t("stats.wins")}
            value={stats[game].currentPrefix}
            color="§a"
          />
          <Table.td
            title={t("stats.losses")}
            value={t(stats[game].overall.losses)}
            color="§c"
          />
          <Table.td
            title={t("stats.wlr")}
            value={t(stats[game].overall.wlr)}
            color="§6"
          />
        </>
      );
    case "bedwars":
      return (
        <>
          <Table.td
            title={t("stats.level")}
            value={stats[game].levelFormatted}
            color="§7"
          />
          <Table.td
            title={t("stats.wins")}
            value={t(stats[game].overall.wins)}
            color="§a"
          />
          <Table.td
            title={t("stats.losses")}
            value={t(stats[game].overall.losses)}
            color="§c"
          />
          <Table.td
            title={t("stats.wlr")}
            value={t(stats[game].overall.wlr)}
            color="§6"
          />
        </>
      );
    case "blitzsg":
      return (
        <>
          <Table.td
            title={t("stats.kills")}
            value={stats[game].currentPrefix}
            color="§a"
          />
          <Table.td
            title={t("stats.deaths")}
            value={t(stats[game].overall.deaths)}
            color="§c"
          />
          <Table.td
            title={t("stats.kdr")}
            value={t(stats[game].overall.kdr)}
            color="§6"
          />
        </>
      );
    case "buildbattle":
      return (
        <>
          <Table.td
            title={t("stats.title")}
            value={stats[game].titleFormatted}
            color="§a"
          />
          <Table.td
            title={t("stats.wins")}
            value={t(stats[game].overall.wins)}
            color="§a"
          />
          <Table.td
            title={t("stats.score")}
            value={t(stats[game].score)}
            color="§b"
          />
        </>
      );
    case "copsandcrims":
      return (
        <>
          <Table.td
            title={t("stats.kills")}
            value={stats[game].levelFormatted}
            color="§a"
          />
          <Table.td
            title={t("stats.deaths")}
            value={t(stats[game].overall.deaths)}
            color="§a"
          />
          <Table.td
            title={t("stats.kdr")}
            value={t(stats[game].overall.kdr)}
            color="§c"
          />
        </>
      );
    case "duels":
      return (
        <>
          <Table.td
            title={t("stats.title")}
            value={stats[game].overall.titleLevelFormatted}
            color="§a"
          />
          <Table.td
            title={t("stats.wins")}
            value={t(stats[game].overall.wins)}
            color="§a"
          />
          <Table.td
            title={t("stats.losses")}
            value={t(stats[game].overall.losses)}
            color="§c"
          />
          <Table.td
            title={t("stats.wlr")}
            value={t(stats[game].overall.wlr)}
            color="§6"
          />
        </>
      );
    case "megawalls":
      return (
        <>
          <Table.td
            title={t("stats.wins")}
            value={t(stats[game].overall.wins)}
            color="§a"
          />
          <Table.td
            title={t("stats.losses")}
            value={t(stats[game].overall.losses)}
            color="§c"
          />
          <Table.td
            title={t("stats.wlr")}
            value={t(stats[game].overall.wlr)}
            color="§6"
          />
        </>
      );
    case "murdermystery":
      return (
        <>
          <Table.td
            title={t("stats.wins")}
            value={t(stats[game].overall.wins)}
            color="§a"
          />
          <Table.td
            title={t("stats.murdererWins")}
            value={t(stats[game].overall.murdererWins)}
            color="§c"
          />
          <Table.td
            title={t("stats.detectiveWins")}
            value={t(stats[game].overall.detectiveWins)}
            color="§b"
          />
        </>
      );
    case "paintball":
      return (
        <>
          <Table.td
            title={t("stats.kills")}
            value={stats[game].naturalPrefix}
            color="§a"
          />
          <Table.td
            title={t("stats.deaths")}
            value={t(stats[game].deaths)}
            color="§a"
          />
          <Table.td
            title={t("stats.kdr")}
            value={t(stats[game].kdr)}
            color="§c"
          />
        </>
      );
    case "pit":
      return (
        <>
          <Table.td
            title={t("stats.level")}
            value={stats[game].levelFormatted}
            color="§a"
          />
          <Table.td
            title={t("stats.kills")}
            value={t(stats[game].kills)}
            color="§a"
          />
          <Table.td
            title={t("stats.deaths")}
            value={t(stats[game].deaths)}
            color="§c"
          />
          <Table.td
            title={t("stats.kdr")}
            value={t(stats[game].kdr)}
            color="§6"
          />
        </>
      );
    case "quake":
      return (
        <>
          <Table.td
            title={t("stats.kills")}
            value={stats[game].naturalPrefix}
            color="§a"
          />
          <Table.td
            title={t("stats.deaths")}
            value={t(stats[game].overall.deaths)}
            color="§a"
          />
          <Table.td
            title={t("stats.kdr")}
            value={t(stats[game].overall.kdr)}
            color="§c"
          />
        </>
      );
    case "skywars":
      return (
        <>
          <Table.td
            title={t("stats.level")}
            value={stats[game].levelFormatted}
            color="§a"
          />
          <Table.td
            title={t("stats.kills")}
            value={t(stats[game].overall.kills)}
            color="§a"
          />
          <Table.td
            title={t("stats.deaths")}
            value={t(stats[game].overall.deaths)}
            color="§c"
          />
          <Table.td
            title={t("stats.kdr")}
            value={t(stats[game].overall.kdr)}
            color="§6"
          />
        </>
      );
    case "smashheroes":
      return (
        <>
          <Table.td
            title={t("stats.level")}
            value={stats[game].levelFormatted}
            color="§a"
          />
          <Table.td
            title={t("stats.wins")}
            value={t(stats[game].overall.wins)}
            color="§a"
          />
          <Table.td
            title={t("stats.losses")}
            value={t(stats[game].overall.losses)}
            color="§c"
          />
          <Table.td
            title={t("stats.wlr")}
            value={t(stats[game].overall.wlr)}
            color="§6"
          />
        </>
      );
    case "speeduhc":
      return (
        <>
          <Table.td
            title={t("stats.level")}
            value={stats[game].levelFormatted}
            color="§a"
          />
          <Table.td
            title={t("stats.wins")}
            value={t(stats[game].overall.wins)}
            color="§a"
          />
          <Table.td
            title={t("stats.losses")}
            value={t(stats[game].overall.losses)}
            color="§c"
          />
          <Table.td
            title={t("stats.wlr")}
            value={t(stats[game].overall.wlr)}
            color="§6"
          />
        </>
      );
    case "tntgames":
      // [TODO]: Add TNT Games stats
      return [t("stats.wins"), t(stats[game].wins)];
    case "turbokartracers":
      return (
        <>
          <Table.td
            title={t("stats.goldTrophies")}
            value={t(stats[game].gold)}
            color="§#ffd700"
          />
          <Table.td
            title={t("stats.silverTrophies")}
            value={t(stats[game].silver)}
            color="§#c0c0c0"
          />
          <Table.td
            title={t("stats.bronzeTrophies")}
            value={t(stats[game].bronze)}
            color="§#cd7f32"
          />
        </>
      );
    case "uhc":
      return (
        <>
          <Table.td
            title={t("stats.level")}
            value={stats[game].levelFormatted}
            color="§a"
          />
          <Table.td
            title={t("stats.wins")}
            value={t(stats[game].overall.wins)}
            color="§a"
          />
          <Table.td
            title={t("stats.kdr")}
            value={t(stats[game].overall.kdr)}
            color="§6"
          />
        </>
      );
    case "vampirez":
      return (
        <>
          <Table.td
            title={t("stats.wins")}
            value={t(stats[game].wins)}
            color="§a"
          />
          <Table.td
            title={t("stats.humanWins")}
            value={stats[game].human.currentPrefix}
            color="§c"
          />
          <Table.td
            title={t("stats.vampireWins")}
            value={stats[game].vampire.currentPrefix}
            color="§6"
          />
        </>
      );
    case "walls":
      return (
        <>
          <Table.td
            title={t("stats.wins")}
            value={t(stats[game].wins)}
            color="§a"
          />
          <Table.td
            title={t("stats.losses")}
            value={t(stats[game].losses)}
            color="§c"
          />
          <Table.td
            title={t("stats.wlr")}
            value={t(stats[game].wlr)}
            color="§6"
          />
        </>
      );
    case "warlords":
      return (
        <>
          <Table.td
            title={t("stats.wins")}
            value={t(stats[game].wins)}
            color="§a"
          />
          <Table.td
            title={t("stats.losses")}
            value={t(stats[game].losses)}
            color="§c"
          />
          <Table.td
            title={t("stats.wlr")}
            value={t(stats[game].wlr)}
            color="§6"
          />
        </>
      );
    case "woolgames":
      return (
        <>
          <Table.td
            title={t("stats.level")}
            value={stats[game].levelFormatted}
            color="§a"
          />
          <Table.td
            title="WoolWars"
            value={t(stats[game].woolwars.overall.wins)}
            color="§a"
          />
          <Table.td
            title="SheepWars"
            value={t(stats[game].sheepwars.wins)}
            color="§c"
          />
          <Table.td
            title="Capture the Wool"
            value={t(stats[game].captureTheWool.wins)}
            color="§6"
          />
        </>
      );
  }
}

const FormattedPlayableGame: Record<PlayableGame, FormattedGame> = {
  arcade: FormattedGame.ARCADE,
  arenabrawl: FormattedGame.ARENA_BRAWL,
  bedwars: FormattedGame.BEDWARS,
  blitzsg: FormattedGame.BLITZSG,
  buildbattle: FormattedGame.BUILD_BATTLE,
  copsandcrims: FormattedGame.COPS_AND_CRIMS,
  duels: FormattedGame.DUELS,
  megawalls: FormattedGame.MEGAWALLS,
  murdermystery: FormattedGame.MURDER_MYSTERY,
  paintball: FormattedGame.PAINTBALL,
  pit: FormattedGame.PIT,
  quake: FormattedGame.QUAKE,
  skywars: FormattedGame.SKYWARS,
  smashheroes: FormattedGame.SMASH_HEROES,
  speeduhc: FormattedGame.SPEED_UHC,
  tntgames: FormattedGame.TNT_GAMES,
  turbokartracers: FormattedGame.TURBO_KART_RACERS,
  uhc: FormattedGame.UHC,
  vampirez: FormattedGame.VAMPIREZ,
  walls: FormattedGame.WALLS,
  warlords: FormattedGame.WARLORDS,
  woolgames: FormattedGame.WOOLGAMES,
};

/* eslint-disable unicorn/numeric-separators-style */
const GameNormal: Record<keyof PlayerStats, [mean: number, stdev: number]> = {
  arcade: [47.943456623159285, 345.45462984480355],
  arenabrawl: [54.54271059484758, 456.7449242807322],
  bedwars: [258.74934632116793, 748.0327413158763],
  blitzsg: [66.62482760173609, 462.74593393363017],
  buildbattle: [14.501026965691436, 96.75410919555686],
  challenges: [703.3189660164868, 1121.0524615976233],
  copsandcrims: [24.66711634640695, 209.2012305609239],
  duels: [498.4884596072068, 2105.437063866322],
  general: [2093.1178095654386, 1720.0900266142357],
  megawalls: [24.53680465485529, 131.15816805113383],
  murdermystery: [150.76623514552855, 915.9276449171637],
  paintball: [23.34181091905699, 117.86448713259242],
  parkour: [0, 0],
  pit: [102.56580072764409, 277.06822675957835],
  quake: [26.814050527274105, 430.61202349308223],
  quests: [413.50770716841487, 981.7769202969056],
  skywars: [228.95944991807306, 987.3697381192043],
  smashheroes: [52.99487443574538, 495.9379499033822],
  speeduhc: [9.100884466556108, 68.29294762132967],
  tntgames: [30.684695073419277, 369.0345100173687],
  turbokartracers: [71.54076539101497, 427.8901349133345],
  uhc: [26.139986346957933, 84.59519407156014],
  vampirez: [20.305040582036874, 231.25314292785842],
  walls: [8.220307526093416, 79.08187919057073],
  warlords: [27.839182249700166, 217.31182795352672],
  woolgames: [21.583678620368413, 285.09386895294614],
};

