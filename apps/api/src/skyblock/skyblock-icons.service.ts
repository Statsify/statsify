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
import { getItemIcon, setHeadSource } from "@statsify/skyblock/icons";
import { lastValueFrom } from "rxjs";
import type { IconSize } from "@statsify/skyblock/icon-key";
import type { ItemTexture } from "@statsify/skyblock";

const HEAD_SECONDS = 30 * 24 * 60 * 60;
/** A head that didn't load draws Steve for this long before its skin is asked for again. */
export const FAILED_HEAD_SECONDS = 60 * 60;
const HEAD_TIMEOUT = 5000;

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

  public constructor(
    private readonly httpService: HttpService,
    @InjectRedis() private readonly redis: Redis
  ) {}

  public onModuleInit() {
    setHeadSource((hash) => this.getHead(hash));
  }

  /** undefined when the 1.8 pack has no texture for the item. */
  public async getIcon(texture: ItemTexture, size: IconSize, glint: boolean): Promise<Icon | undefined> {
    const standIn = texture.kind === "head" && !(await this.getHead(texture.skin));
    const icon = await getItemIcon(texture, { size, glint });
    if (!icon) return undefined;

    return { png: await icon.toBuffer("png"), standIn };
  }

  private async getHead(hash: string): Promise<Buffer | undefined> {
    const [stored, failed] = await Promise.all([this.redis.getBuffer(headKey(hash)), this.redis.exists(failedHeadKey(hash))]);
    if (stored) return stored;
    if (failed) return undefined;

    try {
      const response = await lastValueFrom(
        this.httpService.get<ArrayBuffer>(`https://textures.minecraft.net/texture/${hash}`, {
          responseType: "arraybuffer",
          timeout: HEAD_TIMEOUT,
        })
      );

      const skin = Buffer.from(response.data);
      await this.redis.set(headKey(hash), skin, "EX", HEAD_SECONDS);
      return skin;
    } catch (error) {
      this.logger.warn(`Couldn't load the head ${hash}: ${String(error)}`);
      await this.redis.set(failedHeadKey(hash), "1", "EX", FAILED_HEAD_SECONDS);
      return undefined;
    }
  }
}
