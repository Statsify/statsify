/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Container, Footer, If, List } from "#components";
import { CurrentHistoricalType } from "@statsify/api-client";
import { LocalizeFunction } from "@statsify/discord";
import { User } from "@statsify/schemas";
import { formatPosition } from "#lib/format-position";
import { prettify } from "@statsify/util";
import type { Image } from "skia-canvas";

export type LeaderboardType = "player" | "guild";

export interface LeaderboardData {
  fields: (number | string)[];
  name: string;
  icon?: Image;
  position: number;
  highlight?: boolean;
}

export interface LeaderboardProfileProps {
  background: Image;
  logo: Image;
  user: User | null;
  fields: string[];
  name: string;
  data: LeaderboardData[];
  t: LocalizeFunction;
  type: LeaderboardType;
  time?: CurrentHistoricalType | undefined;
}

export const LeaderboardProfile = ({
  background,
  logo,
  user,
  data,
  fields,
  name,
  t,
  type,
  time,
}: LeaderboardProfileProps) => {
  const titles = ["Pos", prettify(type), ...fields].map((field, index) => (
    <box
      width={index === 1 ? "remaining" : "100%"}
      border={{ topLeft: 4, topRight: 4, bottomLeft: 0, bottomRight: 0 }}
    >
      <text>§l{field}</text>
    </box>
  ));

  const items = data.map((d) => {
    const highlight = d.highlight
      ? { color: "rgba(255, 255, 255, 0.35)", shadowOpacity: 0.3 }
      : undefined;

    return (
      <>
        <box width="100%" {...highlight}>
          <text>{formatPosition(t, d.position)}</text>
        </box>
        <div width="remaining">
          <If condition={d.icon}>
            {(icon) => (
              <box padding={{ left: 12, right: 12, top: 4, bottom: 4 }} {...highlight}>
                <img image={icon} />
              </box>
            )}
          </If>
          <box width="remaining" direction="column" {...highlight}>
            <text align="left">{d.name}</text>
          </box>
        </div>
        {d.fields.map((field) => {
          const formatted = typeof field === "number" ? t(field) : field;

          return (
            <box width="100%" {...highlight}>
              <text>{formatted}</text>
            </box>
          );
        })}
      </>
    );
  });

  return (
    <Container background={background}>
      <div width="100%">
        <If condition={time}>
          {(time) => (
            <box>
              <text>§^3^§l{prettify(time)}</text>
            </box>
          )}
        </If>
        <box width="remaining">
          <text>§^3^§l{name}</text>
        </box>
      </div>
      <List items={[<>{titles}</>, ...items]} />
      <Footer
        logo={logo}
        user={user}
        border={{ bottomLeft: 4, bottomRight: 4, topLeft: 0, topRight: 0 }}
      />
    </Container>
  );
};
