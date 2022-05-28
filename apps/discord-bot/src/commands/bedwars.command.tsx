import { BaseProfileProps } from '#profiles/base.profile';
import { BedWarsProfile } from '#profiles/bedwars.profile';
import { Command } from '@statsify/discord';
import { JSX } from '@statsify/rendering';
import { BEDWARS_MODES } from '@statsify/schemas';
import { HypixelCommand } from './base.hypixel-command';

@Command({ description: 'Displays this message.' })
export class BedWarsCommand extends HypixelCommand<typeof BEDWARS_MODES> {
  public getDimensions(): { width: number; height: number } {
    return {
      width: 870,
      height: 590,
    };
  }

  public getBackground(
    mode: 'overall' | 'core' | 'solo' | 'doubles' | 'threes' | 'fours' | '4v4'
  ): [game: string, mode: string] {
    let map: string;

    switch (mode) {
      case 'overall':
      case 'core':
        map = 'overall';
        break;
      case 'solo':
      case 'doubles':
        map = 'eight';
        break;
      case 'threes':
      case 'fours':
        map = 'four';
        break;
      case '4v4':
        map = '4v4';
        break;
    }

    return ['bedwars', map];
  }

  public getModes(): readonly ['overall', 'core', 'solo', 'doubles', 'threes', 'fours', '4v4'] {
    return BEDWARS_MODES;
  }

  public getProfile(
    base: BaseProfileProps,
    mode: 'overall' | 'core' | 'solo' | 'doubles' | 'threes' | 'fours' | '4v4'
  ): JSX.ElementNode {
    return <BedWarsProfile {...base} mode={mode} />;
  }
}
