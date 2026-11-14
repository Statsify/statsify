/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  Command,
  EmbedBuilder,
  PlayerArgument,
  SubCommand,
} from "@statsify/discord";

import { STATUS_COLORS } from "@statsify/logger";
import { getAssetPath } from "@statsify/assets";
import { readFileSync } from "node:fs";
import type { HistoricalType } from "@statsify/api-client";

const preview = {
  name: "preview.png",
  data: readFileSync(getAssetPath("previews/session.png")),
  type: "image/png",
};

const embed = new EmbedBuilder()
  .color(STATUS_COLORS.info)
  .title((t) => t("historical.disabledWarning.title"))
  .description((t) => t("historical.disabledWarning.description"))
  .image(`attachment://${preview.name}`);

const message = { embeds: [embed], files: [preview] };

const args = [PlayerArgument];

@Command({ description: "" })
export class HistoricalBase {
  public constructor(private readonly time: HistoricalType) {}

  @SubCommand({ description: (t) => t("commands.historical-arcade"), args })
  public arcade() {
    return message;
  }

  @SubCommand({
    description: (t) => t("commands.historical-arenabrawl"),
    args,
    group: "classic",
  })
  public arenabrawl() {
    return message;
  }

  @SubCommand({ description: (t) => t("commands.historical-bedwars"), args })
  public bedwars() {
    return message;
  }

  @SubCommand({ description: (t) => t("commands.historical-bridge"), args })
  public bridge() {
    return message;
  }

  @SubCommand({ description: (t) => t("commands.historical-blitzsg"), args })
  public blitzsg() {
    return message;
  }

  @SubCommand({ description: (t) => t("commands.historical-buildbattle"), args })
  public buildbattle() {
    return message;
  }

  @SubCommand({ description: (t) => t("commands.historical-copsandcrims"), args })
  public copsandcrims() {
    return message;
  }

  @SubCommand({ description: (t) => t("commands.historical-duels"), args })
  public duels() {
    return message;
  }

  @SubCommand({ description: (t) => t("commands.historical-general"), args })
  public general() {
    return message;
  }

  @SubCommand({ description: (t) => t("commands.historical-megawalls"), args })
  public megawalls() {
    return message;
  }

  @SubCommand({ description: (t) => t("commands.historical-murdermystery"), args })
  public murdermystery() {
    return message;
  }

  @SubCommand({
    description: (t) => t("commands.historical-paintball"),
    args,
    group: "classic",
  })
  public paintball() {
    return message;
  }

  @SubCommand({
    description: (t) => t("commands.historical-pit"),
    args,
  })
  public pit() {
    return message;
  }

  @SubCommand({
    description: (t) => t("commands.historical-quake"),
    args,
    group: "classic",
  })
  public quake() {
    return message;
  }

  @SubCommand({ description: (t) => t("commands.historical-skywars"), args })
  public skywars() {
    return message;
  }

  @SubCommand({ description: (t) => t("commands.historical-smashheroes"), args })
  public smashheroes() {
    return message;
  }

  @SubCommand({ description: (t) => t("commands.historical-speeduhc"), args })
  public speeduhc() {
    return message;
  }

  @SubCommand({ description: (t) => t("commands.historical-tntgames"), args })
  public tntgames() {
    return message;
  }

  @SubCommand({
    description: (t) => t("commands.historical-turbokartracers"),
    args,
    group: "classic",
  })
  public turbokartracers() {
    return message;
  }

  @SubCommand({ description: (t) => t("commands.historical-uhc"), args })
  public uhc() {
    return message;
  }

  @SubCommand({
    description: (t) => t("commands.historical-vampirez"),
    args,
    group: "classic",
  })
  public vampirez() {
    return message;
  }

  @SubCommand({
    description: (t) => t("commands.historical-walls"),
    args,
    group: "classic",
  })
  public walls() {
    return message;
  }

  @SubCommand({ description: (t) => t("commands.historical-warlords"), args })
  public warlords() {
    return message;
  }

  @SubCommand({ description: (t) => t("commands.historical-woolgames"), args })
  public woolgames() {
    return message;
  }
}
