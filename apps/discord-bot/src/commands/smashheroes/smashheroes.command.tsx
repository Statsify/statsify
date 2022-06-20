/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Command } from '@statsify/discord';
import { SmashHeroesModes, SMASH_HEROES_MODES } from '@statsify/schemas';
import { BaseHypixelCommand, BaseProfileProps, ProfileData } from '../base.hypixel-command';
import { SmashHeroesProfile } from './smashheroes.profile';

@Command({ description: (t) => t('commands.smashheroes') })
export class SmashHeroesCommand extends BaseHypixelCommand<SmashHeroesModes> {
  public constructor() {
    super(SMASH_HEROES_MODES);
  }

  public getProfile(
    base: BaseProfileProps,
    { mode }: ProfileData<SmashHeroesModes, never>
  ): JSX.Element {
    return <SmashHeroesProfile {...base} mode={mode} />;
  }
}
