/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ApiException } from "../exception.ts";
import { DiscordIdSchema, UserSlugSchema, UuidSchema, VerifyCodeSchema, validator } from "../middleware/validation.ts";
import { Hono } from "hono";
import { Permissions, Policy, auth } from "../middleware/auth.ts";
import { Readable } from "node:stream";
import { User, VerifyCode } from "@statsify/schemas";
import { config } from "@statsify/util";
import { createReadStream } from "node:fs";
import { getLogoPath } from "@statsify/assets";
import { getModelForClass } from "@typegoose/typegoose";
import { join } from "node:path";
import { openapi } from "../middleware/openapi.ts";
import { rm } from "node:fs/promises";
import { z } from "zod";

const UserModel = getModelForClass(User);
const VerifyCodeModel = getModelForClass(VerifyCode);

const UserNotFoundException = new ApiException(404, ["User Not Found"]);
const BadgeNotFoundException = new ApiException(404, ["Badge Not Found"]);
const VerifyCodeNotFoundException = new ApiException(404, ["Verification Code Not Found"]);

const UserReadOrManage = Policy.some(Policy.has(Permissions.UserRead), Policy.has(Permissions.UserManage));

// [TODO]: update user, set badge

export const usersRouter = new Hono()
  // Get User
  .get(
    "/",
    openapi({
      tags: ["Users"],
      operationId: "getUser",
      summary: "Get a User",
    }),
    auth({ policy: UserReadOrManage }),
    validator("query", z.object({ tag: UserSlugSchema })),
    async (c) => {
      const { tag } = c.req.valid("query");
      const kind = identifyTagKind(tag);
      const user = await UserModel.findOne().where(kind).equals(tag).lean().exec();

      if (!user) throw UserNotFoundException;

      return c.json({ success: true, user: user as User });
    })
  // Update User
  .patch(
    "/",
    openapi({
      tags: ["Users"],
      operationId: "updateUser",
      summary: "Update a User",
    }),
    auth({ policy: Policy.has(Permissions.UserManage) }),
    (c) => c.text("hello world")
  )
  // Verify User
  .put(
    "/",
    openapi({
      tags: ["Users"],
      operationId: "verifyUser",
      summary: "Verify a User",
    }),
    auth({ policy: Policy.has(Permissions.UserManage) }),
    validator("query", z.intersection(
      z.union([z.object({ uuid: UuidSchema }), z.object({ code: VerifyCodeSchema })]),
      z.object({ id: DiscordIdSchema })
    )),
    async (c) => {
      const { id, ...query } = c.req.valid("query");

      let uuid: string;

      // If the uuid is provided in the route then we are forcefully verifying a user
      if ("uuid" in query) {
        uuid = query.uuid;
      } else {
      // Find the associated uuid for the verification code
        const verifyCode = await VerifyCodeModel
          .findOneAndDelete()
          .where("code")
          .equals(query.code)
          .lean()
          .exec();

        if (!verifyCode) throw VerifyCodeNotFoundException;

        uuid = verifyCode.uuid;
      }

      // Unverify anyone previously linked to this UUID
      await UserModel
        .updateMany({ uuid }, { $unset: { uuid: "" } })
        .lean()
        .exec();

      // Link the discord id to the UUID
      const user = await UserModel
        .findOneAndUpdate(
          { id },
          { id, uuid, verifiedAt: Date.now() },
          { upsert: true, new: true }
        )
        .lean()
        .exec();

      return c.json({ success: true, user: user as User });
    })
  // Unverify User
  .delete(
    "/",
    openapi({
      tags: ["Users"],
      operationId: "unverifyUser",
      summary: "Unverify a User",
    }),
    auth({ policy: Policy.has(Permissions.UserManage) }),
    validator("query", z.object({ tag: UserSlugSchema })),
    async (c) => {
      const { tag } = c.req.valid("query");
      const kind = identifyTagKind(tag);

      const user = await UserModel
        .findOneAndUpdate(
          { [kind]: tag },
          { $unset: { uuid: "" }, unverifiedAt: Date.now() },
          { new: true }
        )
        .lean()
        .exec();

      if (!user) throw UserNotFoundException;

      return c.json({ success: true, user: user as User });
    })
  // Get Badge
  .get(
    "/badge",
    openapi({
      tags: ["Users"],
      operationId: "getUserBadge",
      summary: "Get a User's Badge",
    }),
    auth({ policy: UserReadOrManage }),
    validator("query", z.object({ tag: UserSlugSchema })),
    async (c) => {
      const { tag } = c.req.valid("query");
      const kind = identifyTagKind(tag);
      const user = await UserModel.findOne().where(kind).equals(tag).lean().exec();

      if (!user) throw UserNotFoundException;

      let path: string | undefined = undefined;

      if (user.hasBadge && User.isGold(user)) {
        path = badgePath(user.id);
      } else if (user.tier) {
        path = getLogoPath(user);
      } else if (user.uuid) {
        path = getLogoPath("verified", 28);
      }

      if (!path) throw BadgeNotFoundException;

      c.header("Content-Type", "image/png");

      const badge = createReadStream(path);
      const stream = Readable.toWeb(badge);

      return c.body(stream as ReadableStream);
    })
  // Set Badge
  .put(
    "/badge",
    openapi({
      tags: ["Users"],
      operationId: "updateUserBadge",
      summary: "Set a User's Badge",
    }),
    auth({ policy: Policy.has(Permissions.UserManage) }),
    (c) => c.text("hello world")
  )
  // Reset Badge
  .delete(
    "/badge",
    openapi({
      tags: ["Users"],
      operationId: "resetUserBadge",
      summary: "Reset a User's Badge",
    }),
    auth({ policy: Policy.has(Permissions.UserManage) }),
    validator("query", z.object({ tag: UserSlugSchema })),
    async (c) => {
      const { tag } = c.req.valid("query");
      const kind = identifyTagKind(tag);

      const user = await UserModel
        .findOneAndUpdate({ hasBadge: false })
        .where(kind)
        .equals(tag)
        .lean()
        .exec();

      if (!user) throw UserNotFoundException;

      const path = badgePath(user.id);
      await rm(path);

      return c.json({ success: true });
    });

/**
   *
   * @param tag a user slug
   * @returns whether a user slug is a Uuid or a DiscordId
   */
function identifyTagKind(tag: string) {
  return tag.length >= 32 ? "uuid" : "id";
}

const mediaRoot = config("api.mediaRoot");

function badgePath(id: string) {
  return join(mediaRoot, `/badges/${id}.png`);
}
