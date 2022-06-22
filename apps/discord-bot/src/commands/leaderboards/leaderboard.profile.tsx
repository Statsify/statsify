/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Container, Footer, If, List } from "#components";
import { LocalizeFunction } from "@statsify/discord";
import { UserTier } from "@statsify/schemas";
import { prettify } from "@statsify/util";
import type { Image } from "skia-canvas";

const formatPosition = (t: LocalizeFunction, position: number): string => {
  let color = "§f";

  switch (position) {
    case 1: {
      color = "§#ffd700";
      break;
    }
    case 2: {
      color = "§#c0c0c0";
      break;
    }
    case 3:
      {
        color = "§#cd7f32";
        // No default
      }
      break;
  }

  return `${color}#§l${t(position)}`;
};

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
  tier?: UserTier;
  fields: string[];
  name: string;
  data: LeaderboardData[];
  t: LocalizeFunction;
  type: LeaderboardType;
}

export const LeaderboardProfile = ({
  background,
  logo,
  tier,
  data,
  fields,
  name,
  t,
  type,
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
      <box width="100%">
        <text>§^3^§l{name}</text>
      </box>
      <List items={[<>{titles}</>, ...items]} />
      <Footer
        logo={logo}
        tier={tier}
        border={{ bottomLeft: 4, bottomRight: 4, topLeft: 0, topRight: 0 }}
      />
    </Container>
  );
};
