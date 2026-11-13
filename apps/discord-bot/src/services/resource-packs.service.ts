/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Logger } from "@statsify/logger";
import { Service } from "typedi";
import { activeResourcePacks, loadResourcePacks, updateResourcePacks } from "@statsify/assets/resource-packs";
import { setResourcePacks } from "@statsify/skyblock/icons";

const UPDATE_INTERVAL = 6 * 60 * 60 * 1000;

/** Keeps SkyBlock's item icons on the newest resource packs, which the updater downloads and checks. */
@Service()
export class ResourcePacksService {
  private readonly logger = new Logger("ResourcePacksService");
  private active?: string;

  public async init() {
    // Icons draw from 1.8's textures until packs load, so startup doesn't wait on a download
    await this.load().catch((error) => this.logger.error(error));
    void this.update();
    setInterval(() => void this.update(), UPDATE_INTERVAL);
  }

  private async update() {
    try {
      const update = await updateResourcePacks();

      if (update.status === "held") {
        this.logger.warn(`Hypixel's new pack has a changed license (${update.license}), so it waits for a review`);
      }

      if (update.status === "activated" && update.failedItems.length > 0) {
        this.logger.warn(`The new packs can't draw ${update.failedItems.length} items: ${update.failedItems.join(", ")}`);
      }

      // Another process may have activated packs too
      await this.load();
    } catch (error) {
      this.logger.error(error);
    }
  }

  private async load() {
    if ((await activeResourcePacks()) === this.active) return;

    const packs = await loadResourcePacks();
    setResourcePacks(packs?.stack);
    this.active = packs?.id;
  }
}
