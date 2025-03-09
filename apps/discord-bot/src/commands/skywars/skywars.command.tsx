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
import { SKYWARS_MODES, SkyWarsModes } from "@statsify/schemas";
import { SkyWarsChallengesProfile } from "./skywars-challenges.profile.js";
import { SkyWarsPerksProfile } from "./skywars-perks.profile.js";
import { SkyWarsProfile } from "./skywars.profile.js";
import { getAssetPath } from "@statsify/assets";
import { loadImage } from "@statsify/rendering";
import { readdir } from "node:fs/promises";
import type { Image } from "skia-canvas";

export type PerkIcons = Record<string, Image>;

interface PreProfileData {
  perkIcons: PerkIcons;
}

@Command({ description: (t) => t("commands.skywars") })
export class SkyWarsCommand extends BaseHypixelCommand<SkyWarsModes, PreProfileData> {
  public constructor() {
    super(SKYWARS_MODES);
  }

  public async getPreProfileData(): Promise<PreProfileData> {
    const perkIconPaths = await readdir(getAssetPath("skywars-perks"));

    const perkIcons = await Promise.all(
      perkIconPaths.map(async (perk) => [
        perk.replace(".png", ""),
        await loadImage(getAssetPath(`skywars-perks/${perk}`)),
      ])
    );

    return { perkIcons: Object.fromEntries(perkIcons) };
  }

  public getProfile(
    base: BaseProfileProps,
    { mode, data }: ProfileData<SkyWarsModes, PreProfileData>
  ): JSX.Element {
    if (mode.api === "overall" && mode.submode.api === "challenges") return <SkyWarsChallengesProfile {...base} />;
    if (mode.api === "overall" && mode.submode.api === "perks") return <SkyWarsPerksProfile {...base} perkIcons={data.perkIcons} />;
    return <SkyWarsProfile {...base} mode={mode} />;
  }
}
