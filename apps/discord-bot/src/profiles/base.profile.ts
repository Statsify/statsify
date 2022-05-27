import type { LocalizeFunction } from '@statsify/discord';
import type { Player } from '@statsify/schemas';
import type { Image } from 'skia-canvas/lib';

export interface BaseProfileProps {
  skin: Image;
  player: Player;
  background: Image;
  logo: Image;
  t: LocalizeFunction;
}
