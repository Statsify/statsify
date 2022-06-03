import { Command } from '@statsify/discord';
import { JSX } from '@statsify/rendering';
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
  ): JSX.ElementNode {
    return <SmashHeroesProfile {...base} mode={mode} />;
  }
}
