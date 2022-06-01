import { BaseProfileProps } from '#profiles/base.profile';
import { BuildBattleProfile } from '#profiles/buildbattle.profile';
import { Command } from '@statsify/discord';
import { JSX } from '@statsify/rendering';
import { BuildBattleModes, BUILD_BATTLE_MODES } from '@statsify/schemas';
import { BaseHypixelCommand } from './base.hypixel-command';

@Command({ description: (t) => t('commands.buildbattle') })
export class BuildBattleCommand extends BaseHypixelCommand<BuildBattleModes> {
  public constructor() {
    super(BUILD_BATTLE_MODES);
  }

  public getProfile(base: BaseProfileProps): JSX.ElementNode {
    return <BuildBattleProfile {...base} />;
  }
}
