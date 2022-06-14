import { Command } from '@statsify/discord';
import { InviteCommand } from './invite.command';

@Command({ description: (t) => t('commands.info') })
export class LinksCommand extends InviteCommand {}
