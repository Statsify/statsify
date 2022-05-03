import { NotFoundException } from './base.404';

export class GuildNotFoundException extends NotFoundException {
  public constructor() {
    super('guild');
  }
}
