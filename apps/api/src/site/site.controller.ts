/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ApiExcludeController } from "@nestjs/swagger";
import { Auth, AuthRole } from "#auth";
import { Controller } from "@nestjs/common";
import { Implement, implement } from "@orpc/nest";
import { SiteService } from "./site.service.js";
import { contract } from "@statsify/contract";

/** Every procedure; `refresh` and the lookups weigh 2. */
const SITE_ONLY = { role: AuthRole.SITE, siteUnlimited: true };

/**
 * The site's oRPC procedures under `/rpc`. They need a key with `AuthRole.SITE` or above, so a developer
 * key can't spend the site's Hypixel budget, and the site's key is never rate limited here. Reads answer from Mongo
 * and Redis; `refresh` and the lookups are the only Hypixel paths.
 */
@Controller("/rpc")
@ApiExcludeController()
export class SiteController {
  public constructor(private readonly siteService: SiteService) {}

  @Auth(SITE_ONLY)
  @Implement(contract.player.resolve)
  public resolvePlayer() {
    return implement(contract.player.resolve).handler(({ input }) => this.siteService.resolve(input));
  }

  @Auth(SITE_ONLY)
  @Implement(contract.player.page)
  public playerPage() {
    return implement(contract.player.page).handler(({ input }) => this.siteService.page(input.uuid));
  }

  @Auth(SITE_ONLY)
  @Implement(contract.player.bingo)
  public playerBingo() {
    return implement(contract.player.bingo).handler(({ input }) => this.siteService.bingo(input.uuid));
  }

  @Auth(SITE_ONLY)
  @Implement(contract.player.game)
  public playerGame() {
    return implement(contract.player.game).handler(({ input }) => this.siteService.game(input));
  }

  @Auth(SITE_ONLY)
  @Implement(contract.player.session)
  public playerSession() {
    return implement(contract.player.session).handler(({ input }) => this.siteService.session(input.uuid));
  }

  @Auth(SITE_ONLY)
  @Implement(contract.player.sessionGame)
  public playerSessionGame() {
    return implement(contract.player.sessionGame).handler(({ input }) => this.siteService.sessionGame(input));
  }

  @Auth(SITE_ONLY)
  @Implement(contract.player.full)
  public playerDocument() {
    return implement(contract.player.full).handler(({ input }) => this.siteService.full(input.uuid));
  }

  @Auth({ ...SITE_ONLY, weight: 2 })
  @Implement(contract.player.refresh)
  public refreshPlayer() {
    return implement(contract.player.refresh).handler(({ input }) =>
      this.siteService.refresh(input.uuid, input.clientIp, input.auto)
    );
  }

  @Auth({ ...SITE_ONLY, weight: 2 })
  @Implement(contract.player.lookup)
  public lookupPlayer() {
    return implement(contract.player.lookup).handler(({ input }) =>
      this.siteService.lookup(input.name, input.clientIp)
    );
  }

  @Auth(SITE_ONLY)
  @Implement(contract.guild.page)
  public guildPage() {
    return implement(contract.guild.page).handler(({ input }) => this.siteService.guild(input.name));
  }

  @Auth({ ...SITE_ONLY, weight: 2 })
  @Implement(contract.guild.lookup)
  public lookupGuild() {
    return implement(contract.guild.lookup).handler(({ input }) => this.siteService.lookupGuild(input.name, input.clientIp));
  }

  @Auth(SITE_ONLY)
  @Implement(contract.search.suggest)
  public suggest() {
    return implement(contract.search.suggest).handler(({ input }) => this.siteService.suggest(input.query));
  }

  @Auth(SITE_ONLY)
  @Implement(contract.search.cards)
  public cards() {
    return implement(contract.search.cards).handler(({ input }) => this.siteService.cards(input.names));
  }

  @Auth(SITE_ONLY)
  @Implement(contract.leaderboard.list)
  public leaderboardList() {
    return implement(contract.leaderboard.list).handler(() => this.siteService.leaderboardList());
  }

  @Auth(SITE_ONLY)
  @Implement(contract.leaderboard.game)
  public leaderboardGame() {
    return implement(contract.leaderboard.game).handler(({ input }) => this.siteService.leaderboardGame(input));
  }

  @Auth(SITE_ONLY)
  @Implement(contract.leaderboard.page)
  public leaderboardPage() {
    return implement(contract.leaderboard.page).handler(({ input }) => this.siteService.leaderboardPage(input));
  }

  @Auth(SITE_ONLY)
  @Implement(contract.home.previews)
  public homePreviews() {
    return implement(contract.home.previews).handler(() => this.siteService.homePreviews());
  }

  @Auth(SITE_ONLY)
  @Implement(contract.content.glossary)
  public glossary() {
    return implement(contract.content.glossary).handler(() => this.siteService.glossary());
  }

  @Auth(SITE_ONLY)
  @Implement(contract.content.prestiges)
  public prestiges() {
    return implement(contract.content.prestiges).handler(() => this.siteService.prestiges());
  }
}
