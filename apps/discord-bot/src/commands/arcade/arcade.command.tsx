/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ARCADE_MODES, ApiModeFromGameModes, ArcadeModes, GameModeWithSubModes, SubModeForMode } from "@statsify/schemas";
import { ArcadeProfile } from "./arcade.profile.js";
import {
  BaseHypixelCommand,
  BaseProfileProps,
  ModeEmoji,
  ProfileData,
} from "#commands/base.hypixel-command";
import { Command } from "@statsify/discord";

@Command({ description: (t) => t("commands.arcade") })
export class ArcadeCommand extends BaseHypixelCommand<ArcadeModes> {
  public constructor() {
    super(ARCADE_MODES);
  }

  public getModeEmojis(modes: GameModeWithSubModes<ArcadeModes>[]): ModeEmoji[] {
    return getArcadeModeEmojis(modes);
  }

  public getSubModeEmojis<M extends ApiModeFromGameModes<ArcadeModes>>(
    mode: M,
    submodes: SubModeForMode<ArcadeModes, M>[]
  ): ModeEmoji[] {
    return getArcadeSubModeEmojis(mode, submodes);
  }

  public getProfile(
    base: BaseProfileProps,
    { mode }: ProfileData<ArcadeModes>
  ): JSX.Element {
    return <ArcadeProfile {...base} mode={mode} />;
  }
}

export function getArcadeModeEmojis(modes: GameModeWithSubModes<ArcadeModes>[]): ModeEmoji[] {
  return modes.map(({ emoji }) => emoji ? (t) => t(emoji) : undefined);
}

export function getArcadeSubModeEmojis<M extends ApiModeFromGameModes<ArcadeModes>>(
  _mode: M,
  submodes: SubModeForMode<ArcadeModes, M>[]
): ModeEmoji[] {
  return submodes.map(({ emoji }) => emoji ? (t) => t(emoji) : undefined);
}
