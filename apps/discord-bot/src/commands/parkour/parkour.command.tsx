/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  BaseHypixelCommand,
  BaseProfileProps,
  ProfileData,
} from "../base.hypixel-command";
import { Command } from "@statsify/discord";
import { GameId, PARKOUR_MODES, ParkourModes } from "@statsify/schemas";
import { ParkourProfile } from "./parkour.profile";
import { getAssetPath, getImage } from "@statsify/assets";
import { readdir } from "node:fs/promises";
import type { Image } from "skia-canvas";

interface PreProfileData {
  gameIcons: Record<GameId, Image>;
}

@Command({ description: (t) => t("commands.parkour") })
export class ParkourCommand extends BaseHypixelCommand<ParkourModes, PreProfileData> {
  public constructor() {
    super(PARKOUR_MODES);
  }

  public async getPreProfileData(): Promise<PreProfileData> {
    const gameIconPaths = await readdir(getAssetPath("games"));

    const gameIconsRequest = await Promise.all(
      gameIconPaths.map(async (g) => [
        g.replace(".png", ""),
        await getImage(`games/${g}`),
      ])
    );

    return {
      gameIcons: Object.fromEntries(gameIconsRequest),
    };
  }

  public getProfile(
    base: BaseProfileProps,
    { data }: ProfileData<ParkourModes, PreProfileData>
  ): JSX.Element {
    return <ParkourProfile {...base} gameIcons={data.gameIcons} />;
  }
}
