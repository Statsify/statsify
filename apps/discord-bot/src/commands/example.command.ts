import { Command, CommandContext } from '@statsify/discord';
import { ExampleService } from '../services/example.service';

@Command({
  description: 'Displays this message.',
  cooldown: 5,
})
export class ExampleCommand {
  public constructor(private readonly exampleService: ExampleService) {}

  public run(context: CommandContext) {
    context.reply(this.exampleService.findAll().join(', '));
  }
}
