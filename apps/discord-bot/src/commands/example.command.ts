import { Command, CommandContext } from '@statsify/discord';
import { PaginateService } from '../services/paginate.service';

@Command({ description: 'Page command' })
export class ExampleCommand {
  public constructor(private readonly pageService: PaginateService) {}

  public run(context: CommandContext) {
    return this.pageService.paginate(context, [
      {
        content: 'Hello world',
      },
      {
        content: 'Hello world2',
      },
    ]);
  }
}
