/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type Copy, SkyBlockCopiesService } from "./skyblock-copies.service.js";
import { HypixelService } from "#hypixel";
import { Injectable } from "@nestjs/common";
import {
  type MayorView,
  type RawBingoResource,
  toMayorView,
} from "@statsify/skyblock";
import { getTerm } from "@statsify/skyblock/display";

const ELECTION_KEY = "skyblock:resource:election";
const BINGO_KEY = "skyblock:resource:bingo";

const ELECTION_REFRESH_MS = 30 * 60_000;
const BINGO_REFRESH_MS = 30 * 60_000;

// Hypixel can still send the last mayor after a term ends, so only a copy
// fetched during its term goes out of date when it ends.
const isOutdated = ({ value, fetchedAt }: Copy<MayorView>) =>
  getTerm(value, fetchedAt) !== undefined &&
  getTerm(value, Date.now()) === undefined;

@Injectable()
export class SkyBlockResourcesService {
  // A process keeps what it unzipped, since unzipping per request is slow.
  private mayor?: Copy<MayorView>;
  private bingo?: Copy<RawBingoResource>;

  public constructor(
    private readonly hypixelService: HypixelService,
    private readonly copiesService: SkyBlockCopiesService,
  ) {}

  public async getMayor(): Promise<MayorView | undefined> {
    this.mayor = await this.copiesService.get(
      ELECTION_KEY,
      ELECTION_REFRESH_MS,
      () => this.hypixelService.getSkyBlockElection().then(toMayorView),
      this.mayor,
      isOutdated,
    );

    return this.mayor?.value;
  }

  public async getBingo(): Promise<RawBingoResource | undefined> {
    this.bingo = await this.copiesService.get(
      BINGO_KEY,
      BINGO_REFRESH_MS,
      () => this.hypixelService.getSkyBlockBingoResource(),
      this.bingo,
    );

    return this.bingo?.value;
  }
}
