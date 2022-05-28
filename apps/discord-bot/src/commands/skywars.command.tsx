import { BaseProfileProps } from '#profiles/base.profile';
import { SkyWarsProfile } from '#profiles/skywars.profile';
import { Command } from '@statsify/discord';
import { JSX } from '@statsify/rendering';
import { SKYWARS_MODES } from '@statsify/schemas';
import { HypixelCommand } from './base.hypixel-command';

@Command({ description: (t) => t('commands.skywars') })
export class SkyWarsCommand extends HypixelCommand<typeof SKYWARS_MODES> {
  public getDimensions(): { width: number; height: number } {
    return {
      width: 870,
      height: 760,
    };
  }

  public getBackground(mode: 'overall' | 'solo' | 'doubles'): [game: string, mode: string] {
    return ['skywars', mode === 'overall' ? mode : 'map'];
  }

  public getModes(): readonly ['overall', 'solo', 'doubles'] {
    return SKYWARS_MODES;
  }

  public getProfile(base: BaseProfileProps, mode: 'overall' | 'solo' | 'doubles'): JSX.ElementNode {
    return <SkyWarsProfile {...base} mode={mode} />;
  }
}
