/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ApiExcludeController } from "@nestjs/swagger";
import {
  Controller,
  Get,
  NotFoundException,
  Query,
  Redirect,
  Render,
  Req,
  Res,
} from "@nestjs/common";
import { LinkedRolesService } from "./linked-roles.service.js";
import { Logger } from "@statsify/logger";
import { exchangeCode, getAuthorizeUrl } from "./discord-oauth.js";
import { randomBytes } from "node:crypto";
import type { FastifyReply, FastifyRequest } from "fastify";

const STATE_COOKIE = "linked_roles_state";

const MESSAGES = {
  linked: "Your Hypixel stats are linked. You can go back to Discord now.",
  unverified: "Link your Minecraft account with /verify in Discord first, then connect again.",
  failed: "Linking didn't work. Go back to Discord and try connecting again.",
};

// The app's Linked Roles Verification URL in the Discord Developer Portal points here
@Controller("/linked-roles")
@ApiExcludeController()
export class LinkedRolesController {
  private readonly logger = new Logger("LinkedRolesController");

  public constructor(private readonly linkedRolesService: LinkedRolesService) {}

  @Get()
  @Redirect()
  public authorize(@Res({ passthrough: true }) reply: FastifyReply) {
    if (!this.linkedRolesService.enabled) throw new NotFoundException();

    const state = randomBytes(16).toString("base64url");
    reply.header("set-cookie", stateCookie(state, 300));

    return { url: getAuthorizeUrl(state) };
  }

  @Get("/callback")
  @Render("linked-roles.handlebars")
  public async callback(
    @Req() request: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
    @Query("code") code?: string,
    @Query("state") state?: string
  ) {
    if (!this.linkedRolesService.enabled) throw new NotFoundException();

    const expectedState = readCookie(request, STATE_COOKIE);
    reply.header("set-cookie", stateCookie("", 0));

    if (!code || !state || state !== expectedState) return { message: MESSAGES.failed };

    try {
      const tokens = await exchangeCode(code);
      if (!tokens) return { message: MESSAGES.failed };

      const connection = await this.linkedRolesService.connect(tokens);
      if (!connection) return { message: MESSAGES.unverified };

      const pushed = await this.linkedRolesService.pushLatest(connection);
      return { message: pushed ? MESSAGES.linked : MESSAGES.failed };
    } catch (error) {
      this.logger.error(error);
      return { message: MESSAGES.failed };
    }
  }
}

const stateCookie = (value: string, maxAge: number) =>
  `${STATE_COOKIE}=${value}; Max-Age=${maxAge}; Path=/linked-roles; HttpOnly; Secure; SameSite=Lax`;

const readCookie = (request: FastifyRequest, name: string) =>
  request.headers.cookie
    ?.split(";")
    .map((cookie) => cookie.trim().split("="))
    .find(([key]) => key === name)?.[1];
