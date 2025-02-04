/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ApiModeFromGameModes, DUELS_MODES, DuelsModes, GameModeWithSubModes } from "@statsify/schemas";
import {
  BaseHypixelCommand,
  BaseProfileProps,
  ModeEmoji,
  ProfileData,
} from "#commands/base.hypixel-command";
import { Command } from "@statsify/discord";
import { DuelsProfile } from "./duels.profile.js";
import { getAssetPath } from "@statsify/assets";
import { loadImage } from "@statsify/rendering";
import { readdir } from "node:fs/promises";
import type { Image } from "skia-canvas";

export type DuelsModeIcons = Record<ApiModeFromGameModes<DuelsModes>, Image>;

interface PreProfileData {
  modeIcons: DuelsModeIcons;
}

@Command({ description: (t) => t("commands.duels") })
export class DuelsCommand extends BaseHypixelCommand<DuelsModes, PreProfileData> {
  public constructor() {
    super(DUELS_MODES);
  }

  public async getPreProfileData(): Promise<PreProfileData> {
    const modeIconPaths = await readdir(getAssetPath("duels"));
    const modeIcons = await Promise.all(
      modeIconPaths.map(async (mode) => [mode.replace(".png", ""), await loadImage(getAssetPath(`duels/${mode}`))])
    );

    return { modeIcons: Object.fromEntries(modeIcons) };
  }

  public getModeEmojis(modes: GameModeWithSubModes<DuelsModes>[]): ModeEmoji[] {
    return getDuelsModeEmojis(modes);
  }

  public getProfile(
    base: BaseProfileProps,
    { mode, data }: ProfileData<DuelsModes, PreProfileData>
  ): JSX.Element {
    return <DuelsProfile {...base} mode={mode} modeIcons={data.modeIcons} />;
  }
}

export function getDuelsModeEmojis(modes: GameModeWithSubModes<DuelsModes>[]): ModeEmoji[] {
  return modes.map((m) => (t) => t(`emojis:duels.${m.api}`));
}
