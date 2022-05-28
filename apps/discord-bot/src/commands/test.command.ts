import { PaginateService } from '#services';
import { Command, CommandContext } from '@statsify/discord';

@Command({ description: 'Hello' })
export class TestCommand {
  public constructor(private readonly paginateService: PaginateService) {}

  public run(context: CommandContext) {
    return this.paginateService.scrollingPagination(context, [
      () => ({
        content: 'Hello',
      }),
      () => ({
        content: 'Bye',
      }),
      () => ({
        content: 'EEE',
      }),
    ]);
  }
}
