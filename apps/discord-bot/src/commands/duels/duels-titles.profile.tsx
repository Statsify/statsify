/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Container, Footer, Header } from "#components";
import { FormattedGame } from "@statsify/schemas";

import { Image } from "skia-canvas";
import { LocalizeFunction } from "@statsify/discord";
import { arrayGroup } from "@statsify/util";
import type { BaseProfileProps } from "#commands/base.hypixel-command";
import type { DuelsModeIcons } from "./duels.command.js";

export interface DuelsTitlesProfileProps extends Omit<BaseProfileProps, "time"> {
  modeIcons: DuelsModeIcons;
}

export const DuelsTitlesProfile = ({
  skin,
  player,
  background,
  logo,
  user,
  badge,
  t,
  modeIcons,
}: DuelsTitlesProfileProps) => {
  const { duels } = player.stats;

  const games = [
    { icon: modeIcons.blitzsg, title: duels.blitzsg.titleFormatted, wins: duels.blitzsg.wins },
    { icon: modeIcons.bow, title: duels.bow.titleFormatted, wins: duels.bow.wins },
    { icon: modeIcons.bowSpleef, title: duels.bowSpleef.titleFormatted, wins: duels.bowSpleef.wins },
    { icon: modeIcons.boxing, title: duels.boxing.titleFormatted, wins: duels.boxing.wins },
    { icon: modeIcons.bridge, title: duels.bridge.titleFormatted, wins: duels.bridge.overall.wins },
    { icon: modeIcons.classic, title: duels.classic.titleFormatted, wins: duels.classic.wins },
    { icon: modeIcons.combo, title: duels.combo.titleFormatted, wins: duels.combo.wins },
    { icon: modeIcons.megawalls, title: duels.megawalls.titleFormatted, wins: duels.megawalls.overall.wins },
    { icon: modeIcons.nodebuff, title: duels.nodebuff.titleFormatted, wins: duels.nodebuff.wins },
    { icon: modeIcons.op, title: duels.op.titleFormatted, wins: duels.op.overall.wins },
    { icon: modeIcons.parkour, title: duels.parkour.titleFormatted, wins: duels.parkour.wins },
    { icon: modeIcons.skywars, title: duels.skywars.titleFormatted, wins: duels.skywars.overall.wins },
    { icon: modeIcons.sumo, title: duels.sumo.titleFormatted, wins: duels.sumo.wins },
    { icon: modeIcons.uhc, title: duels.uhc.titleFormatted, wins: duels.uhc.overall.wins },
  ];

  games.sort((a, b) => b.wins - a.wins);
  const groups = arrayGroup(games, games.length / 2);

  return (
    <Container background={background}>
      <Header
        skin={skin}
        name={player.prefixName}
        badge={badge}
        sidebar={[]}
        title={`§l${FormattedGame.DUELS} §fTitles`}
        time="LIVE"
      />
      <div width="100%" direction="column">
        <ModeTitle
          icon={modeIcons.overall}
          title={duels.overall.titleFormatted}
          wins={duels.overall.wins}
          t={t}
        />
        <div width="100%">
          {groups.map((group) => (
            <div width={`1/${groups.length}`} direction="column">
              {group.map(({ icon, title, wins }) => (
                <ModeTitle
                  icon={icon}
                  title={title}
                  wins={wins}
                  t={t}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <Footer logo={logo} user={user} />
    </Container>
  );
};

function ModeTitle({ icon, title, wins, t }: { icon: Image; title: string; wins: number; t: LocalizeFunction }) {
  return (
    <box width="100%" padding={{ left: 8, right: 8, top: 4, bottom: 4 }}>
      <img image={icon} width={32} height={32} />
      <text margin={{ left: 8 }}>
        {title}
      </text>
      <div width="remaining" margin={{ left: 4, right: 4 }} />
      <text>{t(wins)}</text>
    </box>
  );
}
