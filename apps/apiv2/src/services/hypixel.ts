/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import z, { ZodError } from "zod";
import { Guild, Player } from "@statsify/schemas";
import { Logger } from "@statsify/logger";

const BASE_URL = "https://api.hypixel.net/v2";

export class Hypixel {
  private readonly logger: Logger;

  public constructor(private readonly apiKey: string) {
    this.logger = new Logger("hypixel");
  }

  public player(tag: string, type: "name" | "uuid") {
    return this.request(`/player?${type}=${tag}`, z.object({ player: z.object({ uuid: z.string(), displayname: z.string() }).passthrough() }))
      .then((data) => new Player(data.player));
  }

  public guild(tag: string, type: "id" | "player" | "name") {
    return this.request(`/guild?${type}=${tag}`, z.object({ guild: z.object({ name: z.string() }).passthrough() }))
      .then((data) => new Guild(data.guild));
  }

  private async request<T>(path: string, schema: z.ZodType<T>): Promise<T> {
    this.logger.verbose(`Requesting ${path}`);

    const response = await fetch(`${BASE_URL}${path}`, {
      headers: { "API-Key": this.apiKey },
    });

    this.logger.verbose(`Received ${response.status} from ${path}`);

    const data = await response.json();

    try {
      return schema.parse(data);
    } catch (error) {
      if (error instanceof ZodError) {
        this.logger.error(`Failed to parse response from ${path}: ${error.errors.map((error) => error.message).join(", ")}`);
        this.logger.error(data);
      }

      throw error;
    }
  }
}
