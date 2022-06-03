import { Command } from '@statsify/discord';
import { JSX } from '@statsify/rendering';
import { CopsAndCrimsModes, COPS_AND_CRIMS_MODES } from '@statsify/schemas';
import { BaseHypixelCommand, BaseProfileProps, ProfileData } from '../base.hypixel-command';
import { CopsAndCrimsProfile } from './copsandcrims.profile';

@Command({ description: (t) => t('commands.copsandcrims') })
export class CopsAndCrimCommand extends BaseHypixelCommand<CopsAndCrimsModes> {
  public constructor() {
    super(COPS_AND_CRIMS_MODES);
  }

  public getProfile(
    base: BaseProfileProps,
    { mode }: ProfileData<CopsAndCrimsModes>
  ): JSX.ElementNode {
    return <CopsAndCrimsProfile {...base} mode={mode} />;
  }
}
