import { NotFoundException } from './base.404';

export class PlayerNotFoundException extends NotFoundException {
  public constructor() {
    super('player');
  }
}
