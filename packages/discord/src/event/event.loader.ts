/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Container } from "typedi";
import { GatewayDispatchEvents } from "discord-api-types/v10";
import { Logger } from "@statsify/logger";
import { WebsocketShard } from "tiny-discord";
import { readdir } from "node:fs/promises";
import { statSync } from "node:fs";
import type { AbstractEventListener } from "./abstract-event.listener.js";

export class EventLoader {
  private static readonly logger = new Logger("EventLoader");

  public static async load(websocket: WebsocketShard, dir: string) {
    const events = new Map<GatewayDispatchEvents, AbstractEventListener<any>>();
    const files = await this.getEventFiles(dir);

    for (const file of files) {
      const imports = await this.importEvent(file);
      for (const event of imports) events.set(event.event, event);
    }

    websocket.on("event", (event) => {
      const listener = events.get(event.t as GatewayDispatchEvents);
      if (listener) listener.onEvent(event.d);
    });
  }

  private static async importEvent(file: string): Promise<AbstractEventListener<any>[]> {
    const event = await import(file);

    return Object.keys(event)
      .filter((key) => key !== "default")
      .map((key) => {
        try {
          const constructor = event[key];
          const instance = Container.get<AbstractEventListener<any>>(constructor);
          return instance;
        } catch (err) {
          this.logger.error(`Failed to load event in ${file} with import ${key}`);
          this.logger.error(err);
          return null;
        }
      })
      .filter(Boolean) as AbstractEventListener<any>[];
  }

  private static async getEventFiles(dir: string): Promise<string[]> {
    const toLoad: string[] = [];

    const files = await readdir(dir);

    await Promise.all(
      files.map(async (file) => {
        const path = `${dir}/${file}`;

        if (statSync(path).isDirectory()) {
          toLoad.push(...(await this.getEventFiles(path)));
        } else if (file.endsWith(".event.js")) {
          toLoad.push(path);
        }
      })
    );

    return toLoad;
  }
}
