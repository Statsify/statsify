/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  Container,
  Footer,
  SplitPill,
  StatColumn,
  Table,
} from "#components";
import type { Image } from "skia-canvas";
import type { LocalizeFunction } from "@statsify/discord";
import type { Player, User } from "@statsify/schemas";

export const HEAD_SIZE = 32;

export interface CompareProfileProps {
  player: Player;
  player2: Player;
  head1: Image | null;
  head2: Image | null;
  background: Image;
  logo: Image;
  user: User | null;
  t: LocalizeFunction;
  table1: StatColumn[][];
  table2: StatColumn[][];
  title: string;
}

export const CompareProfile = ({
  player,
  player2,
  head1,
  head2,
  background,
  logo,
  user,
  t,
  table1,
  table2,
  title,
}: CompareProfileProps) => {
  const nameRow: JSX.Element[] = [];
  if (head1) nameRow.push(<img image={head1} width={HEAD_SIZE} height={HEAD_SIZE} margin={{ right: 6 }} />);
  nameRow.push(<text>{`§a${player.prefixName} §7vs §c${player2.prefixName}`}</text>);
  if (head2) nameRow.push(<img image={head2} width={HEAD_SIZE} height={HEAD_SIZE} margin={{ left: 6 }} />);

  return (
    <Container background={background}>
      <div width="100%" location="center">
        <text margin={{ top: 8, bottom: 8, left: 12, right: 12 }}>{title}</text>
      </div>
      <div width="100%" location="center" direction="row" margin={{ bottom: 4 }}>
        {nameRow}
      </div>
      <Table.table>
        {table1.map((row, ri) => (
          <Table.tr>
            {row.map((col1, ci) => {
              const col2 = table2[ri][ci];
              const delta = Math.abs(col1.value - col2.value);
              if (col1.comparable === false) {
                return (
                  <Table.td
                    title={col1.title}
                    value={`${t(col1.value)} §7/ ${t(col2.value)}`}
                    color={col1.color}
                  />
                );
              }
              return (
                <SplitPill
                  title={col1.title}
                  leftValue={col1.value}
                  rightValue={col2.value}
                  leftFormatted={t(col1.value)}
                  rightFormatted={t(col2.value)}
                  deltaFormatted={t(delta)}
                  lowerIsBetter={col1.lowerIsBetter}
                />
              );
            })}
          </Table.tr>
        ))}
      </Table.table>
      <Footer logo={logo} user={user} />
    </Container>
  );
};
