import { BaseProfileProps } from '#profiles/base.profile';
import { TurboKartRacersProfile } from '#profiles/turbokartracers.profile';
import { Command } from '@statsify/discord';
import { JSX } from '@statsify/rendering';
import { TurboKartRacersModes, TURBO_KART_RACERS_MODES } from '@statsify/schemas';
import { BaseHypixelCommand } from './base.hypixel-command';

@Command({ description: (t) => t('commands.turbokartracers') })
export class TurboKartRacersCommand extends BaseHypixelCommand<TurboKartRacersModes> {
  public constructor() {
    super(TURBO_KART_RACERS_MODES);
  }

  public getProfile(base: BaseProfileProps): JSX.ElementNode {
    return <TurboKartRacersProfile {...base} />;
  }
}
