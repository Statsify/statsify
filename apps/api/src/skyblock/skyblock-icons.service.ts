/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { HttpService } from "@nestjs/axios";
import { InjectRedis } from "#redis";
import { Injectable, type OnModuleInit } from "@nestjs/common";
import { Logger } from "@statsify/logger";
import { Redis } from "ioredis";
import { Singleflight } from "./singleflight.js";
import { SKIN_URL, getItemIcon, setHeadSource } from "@statsify/skyblock/icons";
import { lastValueFrom } from "rxjs";
import type { IconSize } from "@statsify/skyblock/icon-key";
import type { ItemTexture } from "@statsify/skyblock";

const HEAD_SECONDS = 30 * 24 * 60 * 60;
/** A head that didn't load draws Steve for this long before its skin is asked for again. */
export const FAILED_HEAD_SECONDS = 60 * 60;

const headKey = (hash: string) => `skyblock:head:${hash}`;
const failedHeadKey = (hash: string) => `skyblock:head:failed:${hash}`;

export interface Icon {
  png: Buffer;
  /** Steve in place of a head whose skin didn't load. */
  standIn: boolean;
}

/** Item icons for the site, with every head's skin kept in Redis so one process fetches each once. */
@Injectable()
export class SkyBlockIconsService implements OnModuleInit {
  private readonly logger = new Logger("SkyBlockIconsService");
  private readonly singleflight = new Singleflight();

  public constructor(
    private readonly httpService: HttpService,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  public onModuleInit() {
    setHeadSource((hash) => this.getHead(hash));
  }

  /** undefined when the 1.8 pack has no texture for the item. */
  public async getIcon(
    texture: ItemTexture,
    size: IconSize,
    glint: boolean,
  ): Promise<Icon | undefined> {
    const icon = await getItemIcon(texture, { size, glint });
    if (!icon) return undefined;

    // Only after drawing: it loads the head, which marks a failed load
    const [png, failed] = await Promise.all([
      icon.toBuffer("png"),
      texture.kind === "head"
        ? this.redis.exists(failedHeadKey(texture.skin))
        : 0,
    ]);

    return { png, standIn: failed > 0 };
  }

  private getHead(hash: string): Promise<Buffer | undefined> {
    return this.singleflight.run(hash, async () => {
      const [stored, failed] = await Promise.all([
        this.redis.getBuffer(headKey(hash)),
        this.redis.exists(failedHeadKey(hash)),
      ]);
      if (stored) return stored;
      if (failed) return undefined;

      const response = await lastValueFrom(
        this.httpService.get<ArrayBuffer>(`${SKIN_URL}${hash}`, {
          responseType: "arraybuffer",
        }),
      ).catch(async (error) => {
        this.logger.warn(`Couldn't load the head ${hash}: ${String(error)}`);
        await this.redis.set(
          failedHeadKey(hash),
          "1",
          "EX",
          FAILED_HEAD_SECONDS,
        );
        return undefined;
      });
      if (!response) return undefined;

      const skin = Buffer.from(response.data);
      await this.redis.set(headKey(hash), skin, "EX", HEAD_SECONDS);
      return skin;
    });
  }
}
