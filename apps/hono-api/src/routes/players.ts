/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { HTTPException } from "hono/http-exception";
import { Hono } from "hono";
import { Player } from "@statsify/schemas";
import { PlayerSlugSchema } from "../validation.js";
import { getModelForClass } from "@typegoose/typegoose";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

const PlayerModel = getModelForClass(Player);

const PlayerNotFoundException = new HTTPException(404, { message: "Player not found" });

export const playersRouter = new Hono()
  // Get Player
  .get("/", zValidator("query", z.object({ player: PlayerSlugSchema })), async (c) => {})
  // Update Player
  .post("/", (c) => c.text("Hello World"))
  // Delete Player
  .delete("/", zValidator("query", z.object({ player: PlayerSlugSchema })), (c) => c.text("Hello World"))
  // Get Player Status
  .get("/status", zValidator("query", z.object({ player: PlayerSlugSchema })), (c) => c.text("Hello World"))
  // Get a Group of Players
  .get("/group", zValidator("query", z.object({ start: z.number().int().nonnegative(), end: z.number().int().positive() })), (c) => c.text("Hello World"));
