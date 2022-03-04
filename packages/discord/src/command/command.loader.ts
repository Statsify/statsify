import { statSync } from 'fs';
import { readdir } from 'fs/promises';

export class CommandLoader {
  public static async load(dir: string) {
    const files = await this.getCommandFiles(dir);

    console.log(files);
  }

  private static async getCommandFiles(dir: string): Promise<string[]> {
    const toLoad: string[] = [];

    const files = await readdir(dir);

    await Promise.all(
      files.map(async (file) => {
        const path = `${dir}/${file}`;

        if (statSync(path).isDirectory()) {
          toLoad.push(...(await this.getCommandFiles(path)));
        } else if (file.endsWith('.command.js')) {
          toLoad.push(path);
        }
      })
    );

    return toLoad;
  }
}
