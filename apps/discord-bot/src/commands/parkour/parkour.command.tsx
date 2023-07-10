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
} from "#commands/base.hypixel-command";
import { Command } from "@statsify/discord";
import { GameId, PARKOUR_MODES, ParkourModes } from "@statsify/schemas";
import { ParkourProfile } from "./parkour.profile.js";
import { getAllGameIcons } from "@statsify/assets";
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
    return { gameIcons: await getAllGameIcons() };
  }

  public getProfile(
    base: BaseProfileProps,
    { data }: ProfileData<ParkourModes, PreProfileData>
  ): JSX.Element {
    return <ParkourProfile {...base} gameIcons={data.gameIcons} />;
  }
}
