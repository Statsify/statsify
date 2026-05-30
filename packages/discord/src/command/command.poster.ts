/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { APIApplicationCommand } from "discord-api-types/v10";
import { Logger } from "@statsify/logger";
import { RestClient } from "tiny-discord";
import { Service } from "typedi";
import { parseDiscordResponse } from "#util/parse-discord-error";
import { readFile, writeFile } from "node:fs/promises";
import type { CommandResolvable } from "./command.resolvable.js";

type CommandCache = {
  guildId?: string;
  commands: Record<string, unknown>;
};

@Service()
export class CommandPoster {
  private readonly logger = new Logger("CommandPoster");

  public constructor(private readonly rest: RestClient) {}

  public async post(
    command: CommandResolvable,
    applicationId: string,
    guildId?: string
  ): Promise<APIApplicationCommand>;
  public async post(
    commands: Map<string, CommandResolvable>,
    applicationId: string,
    guildId?: string
  ): Promise<APIApplicationCommand[] | null>;
  public async post(
    commands: CommandResolvable | Map<string, CommandResolvable>,
    applicationId: string,
    guildId?: string
  ): Promise<APIApplicationCommand | APIApplicationCommand[] | null> {
    if (commands instanceof Map) return this.postAll(commands, applicationId, guildId);
    return this.postSingle(commands, applicationId, guildId);
  }

  public async delete(id: string, applicationId: string, guildId?: string) {
    const response = await this.rest.delete(
      `/applications/${applicationId}/${this.getGuildRoute(guildId)}/commands/${id}`
    );

    parseDiscordResponse(response);
  }

  private async postAll(
    commands: Map<string, CommandResolvable>,
    applicationId: string,
    guildId?: string
  ): Promise<APIApplicationCommand[] | null> {
    const commandsToPost = [...commands.values()];

    if (!(await this.shouldPost(commands, guildId))) {
      this.logger.log("No changes to commands, skipping");
      return null;
    }

    const response = await this.rest.put(
      `/applications/${applicationId}/${this.getGuildRoute(guildId)}/commands`,
      commandsToPost
    );

    try {
      const cmds = parseDiscordResponse<APIApplicationCommand[]>(response);
      this.logger.log(`Successfully posted ${commandsToPost.length} commands`);
      return cmds;
    } catch (err) {
      this.logger.error("Failed to post commands");
      this.logger.error(err);
      return null;
    }
  }

  private async postSingle(
    command: CommandResolvable,
    applicationId: string,
    guildId?: string
  ): Promise<APIApplicationCommand> {
    const response = await this.rest.post(
      `/applications/${applicationId}/${this.getGuildRoute(guildId)}/commands/`,
      command.toJSON()
    );

    return parseDiscordResponse(response);
  }

  private async shouldPost(commands: Map<string, CommandResolvable>, guildId?: string) {
    const file = await readFile("./commands.json", "utf8").catch(() => null);
    const { cache, shouldPost } = getCommandCacheStatus(file, commands, guildId);

    if (file !== cache) await writeFile("./commands.json", cache);

    return shouldPost;
  }

  private getGuildRoute(guildId?: string) {
    return guildId ? `guilds/${guildId}` : "";
  }
}

function getCommandCacheStatus(
  file: string | null,
  commands: Map<string, CommandResolvable> | Record<string, unknown>,
  guildId?: string
) {
  const cache = serializeCommandCache(commands, guildId);

  if (file === cache) return { cache, shouldPost: false };
  if (!file) return { cache, shouldPost: true };

  const parsed = JSON.parse(file) as CommandCache;

  return {
    cache,
    shouldPost: serializeCommandCache(parsed.commands, parsed.guildId) !== cache,
  };
}

function serializeCommandCache(
  commands: Map<string, CommandResolvable> | Record<string, unknown>,
  guildId?: string
) {
  const commandEntries = commands instanceof Map ? commands.entries() : Object.entries(commands);

  return JSON.stringify(
    sortJson({
      guildId,
      commands: Object.fromEntries(
        [...commandEntries]
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([key, value]) => [
            key,
            value instanceof Object && "toJSON" in value ?
              (value.toJSON as () => unknown)() :
              value,
          ])
      ),
    })
  );
}

function sortJson(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortJson);

  if (!value || typeof value !== "object") return value;

  return Object.fromEntries(
    Object.entries(value)
      .filter(([, nestedValue]) => nestedValue !== undefined)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, nestedValue]) => [key, sortJson(nestedValue)])
  );
}

if (import.meta.vitest) {
  const { suite, it, expect } = import.meta.vitest;

  suite("CommandPoster", () => {
    it("serializes command caches deterministically", () => {
      const commands = new Map([
        [
          "beta",
          {
            toJSON: () => ({ name: "beta", description: "Beta", options: [] }),
          } as unknown as CommandResolvable,
        ],
        [
          "alpha",
          {
            toJSON: () => ({ options: [], description: "Alpha", name: "alpha" }),
          } as unknown as CommandResolvable,
        ],
      ]);

      expect(serializeCommandCache(commands)).toBe(
        "{\"commands\":{\"alpha\":{\"description\":\"Alpha\",\"name\":\"alpha\",\"options\":[]},\"beta\":{\"description\":\"Beta\",\"name\":\"beta\",\"options\":[]}}}"
      );
    });

    it("preserves array order while sorting object keys", () => {
      expect(
        serializeCommandCache({
          alpha: {
            options: [
              { name: "first", type: 1 },
              { type: 1, name: "second" },
            ],
            name: "alpha",
          },
        })
      ).toBe(
        "{\"commands\":{\"alpha\":{\"name\":\"alpha\",\"options\":[{\"name\":\"first\",\"type\":1},{\"name\":\"second\",\"type\":1}]}}}"
      );
    });

    it("skips posting when an existing cache is semantically unchanged", () => {
      const previousCache =
        "{\"commands\":{\"alpha\":{\"options\":[],\"description\":\"Alpha\",\"name\":\"alpha\"}}}";
      const commands = new Map([
        [
          "alpha",
          {
            toJSON: () => ({ name: "alpha", description: "Alpha", options: [] }),
          } as unknown as CommandResolvable,
        ],
      ]);

      expect(getCommandCacheStatus(previousCache, commands).shouldPost).toBe(false);
    });

    it("posts when commands are removed from the cache", () => {
      const previousCache =
        "{\"commands\":{\"alpha\":{\"name\":\"alpha\"},\"beta\":{\"name\":\"beta\"}}}";

      expect(
        getCommandCacheStatus(previousCache, { alpha: { name: "alpha" } }).shouldPost
      ).toBe(true);
    });

    it("posts when the command guild changes", () => {
      const previousCache =
        "{\"commands\":{\"alpha\":{\"name\":\"alpha\"}},\"guildId\":\"previous\"}";

      expect(
        getCommandCacheStatus(previousCache, { alpha: { name: "alpha" } }, "next")
          .shouldPost
      ).toBe(true);
    });
  });
}
