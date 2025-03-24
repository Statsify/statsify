/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type ZodSchema, z } from "zod";
import { zValidator } from "@hono/zod-validator";
import type { Env, Input, MiddlewareHandler, ValidationTargets } from "hono";

export const UuidSchema = z
  .string()
  .transform((value) => value.toLowerCase().replaceAll("-", ""))
  .pipe(z.string().length(32).regex(/^[0-9a-f]{8}[0-9a-f]{4}4[0-9a-f]{3}[089ab][0-9a-f]{3}[0-9a-f]{12}/i, "Invalid UUID"));
  // .openapi({
  //   description: "Uuid",
  //   examples: [
  //     "618a96fec8b0493fa89427891049550b",
  //     "618a96fe-c8b0-493f-a894-27891049550b",
  //   ],
  // });

export const DiscordIdSchema = z.string();

export const UsernameSchema = z.string()
  .min(1)
  .max(16)
  .transform((username) => username.toLowerCase());
  // .openapi({
  //   description: "Minecraft Username",
  //   example: "j4cobi",
  // });

export const VerifyCodeSchema = z.string().length(4);

export const PlayerSlugSchema = z.union([
  UuidSchema,
  UsernameSchema,
]);
// .openapi({
//   description: "Username or Uuid",
//   examples: ["j4cobi", "618a96fec8b0493fa89427891049550b"],
// });

export const UserSlugSchema = z.union([
  UuidSchema,
  DiscordIdSchema,
]);

export const CacheLevelSchema = z.enum(["Cache", "CacheOnly", "Live"]);
export type CacheLevel = z.infer<typeof CacheLevelSchema>;

export function validator<
  T extends ZodSchema<any, z.ZodTypeDef, any>,
  Target extends keyof ValidationTargets,
  E extends Env,
  P extends string,
  I extends Input = {
    in: { [K in Target]: z.input<T> };
    out: { [K_2 in Target]: z.output<T>; };
  }
>(
  target: Target,
  schema: T
): MiddlewareHandler<E, P, I> {
  // zValidator has strange typing where it only accepts string inputs for certain targets
  // By typing the input more simply it lets numbers and other stringifiable types be passed through the hono client
  return zValidator(target, schema, (result, c) => {
    if (!result.success) {
      return c.json({ success: false, issues: result.error.flatten().fieldErrors }, 400);
    }

    return result.data;
  }) as unknown as MiddlewareHandler<E, P, I>;
}
