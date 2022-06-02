import { ArenaBrawlProfile } from '#profiles/arenabrawl.profile';
import { BaseProfileProps } from '#profiles/base.profile';
import { Command } from '@statsify/discord';
import { JSX } from '@statsify/rendering';
import { ArenaBrawlModes, ARENA_BRAWL_MODES } from '@statsify/schemas';
import { BaseHypixelCommand, ProfileData } from './base.hypixel-command';

@Command({ description: (t) => t('commands.arenabrawl') })
export class ArenaBrawlCommand extends BaseHypixelCommand<ArenaBrawlModes> {
  public constructor() {
    super(ARENA_BRAWL_MODES);
  }

  public getProfile(
    base: BaseProfileProps,
    { mode }: ProfileData<ArenaBrawlModes, never>
  ): JSX.ElementNode {
    return <ArenaBrawlProfile {...base} mode={mode} />;
  }
}
