import type { LocalizeFunction } from '@statsify/discord';
import type { Player } from '@statsify/schemas';
import type { Image } from 'skia-canvas';

export interface BaseProfileProps {
  skin: Image;
  player: Player;
  background: Image;
  logo: Image;
  premium?: boolean;
  badge?: Image;
  t: LocalizeFunction;
}
