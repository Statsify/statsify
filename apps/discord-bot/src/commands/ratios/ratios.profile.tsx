/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Container, Footer, Header, List, Table } from "#components";
import { FormattedGame, GameMode } from "@statsify/schemas";
import { LocalizeFunction } from "@statsify/discord";
import { ratio } from "@statsify/math";
import type { BaseProfileProps } from "#commands/base.hypixel-command";

interface RatioProps {
  ratioTitle: string;
  numeratorTitle: string;
  numeratorValue: number;
  denominatorValue: number;
  t: LocalizeFunction;
}

const Milestone = ({
  ratioTitle,
  numeratorTitle,
  numeratorValue,
  denominatorValue,
  t,
}: RatioProps) => {
  const ratioValue = ratio(numeratorValue, denominatorValue);
  const newRatio = Math.floor(ratioValue) + 1;
  let needed = newRatio * denominatorValue - numeratorValue;
  needed = needed <= 0 ? 1 : needed;

  return (
    <>
      <box
        width="remaining"
        direction="column"
        border={{ bottomLeft: 4, topLeft: 4, topRight: 0, bottomRight: 0 }}
      >
        <text align="left">
          §a{numeratorTitle} §fto §6{t(newRatio)} {ratioTitle}
        </text>
      </box>
      <box border={{ bottomLeft: 0, topLeft: 0, topRight: 4, bottomRight: 4 }}>
        <text>§a{t(needed)}</text>
      </box>
    </>
  );
};

const Estimation = ({
  ratioTitle,
  numeratorTitle,
  numeratorValue,
  denominatorValue,
  t,
}: RatioProps) => {
  const ratioValue = ratio(numeratorValue, denominatorValue);
  const targetRatio = Math.floor(ratioValue) + 1;

  const newNumerator = Math.ceil(
    (1 + targetRatio / (targetRatio + 1) - ratioValue / targetRatio) * numeratorValue +
      denominatorValue
  );

  return (
    <>
      <box
        width="remaining"
        direction="column"
        border={{ bottomLeft: 4, topLeft: 4, topRight: 0, bottomRight: 0 }}
      >
        <text align="left">
          §a{numeratorTitle} §fat §6{t(targetRatio)} {ratioTitle}
        </text>
      </box>
      <box border={{ bottomLeft: 0, topLeft: 0, topRight: 4, bottomRight: 4 }}>
        <text>§a{t(newNumerator === 0 ? 1 : newNumerator)}</text>
      </box>
    </>
  );
};

export type RatioWithStats = [
  numeratorValue: number,
  denominatorValue: number,
  numeratorTitle: string,
  ratioTitle: string
];

export interface RatiosProfileProps extends Omit<BaseProfileProps, "time"> {
  mode: GameMode<any>;

  ratios: RatioWithStats[];

  gameName: FormattedGame;
}

export const RatiosProfile = ({
  skin,
  player,
  background,
  logo,
  user,
  badge,
  mode,
  ratios,
  t,
  gameName,
}: RatiosProfileProps) => (
  <Container background={background}>
    <Header
      badge={badge}
      time="LIVE"
      name={player.prefixName}
      skin={skin}
      title={`§l${gameName} §fRatios §r(${mode.formatted})`}
    />
    <Table.table>
      <Table.tr>
        <Table.ts title="Milestones">
          <List
            items={ratios.map((r) => (
              <Milestone
                numeratorValue={r[0]}
                denominatorValue={r[1]}
                numeratorTitle={r[2]}
                ratioTitle={r[3]}
                t={t}
              />
            ))}
          />
        </Table.ts>
        <Table.ts title="Estimations">
          <List
            items={ratios.map((r) => (
              <Estimation
                numeratorValue={r[0]}
                denominatorValue={r[1]}
                numeratorTitle={r[2]}
                ratioTitle={r[3]}
                t={t}
              />
            ))}
          />
        </Table.ts>
      </Table.tr>
    </Table.table>
    <Footer logo={logo} user={user} />
  </Container>
);
