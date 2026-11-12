/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ORPCError } from "@orpc/client";
import { UUID_PATTERN } from "~/lib/uuid";
import { createServerFn } from "@tanstack/react-start";
import { rpcServerClient } from "~/server/rpc.server";
import { sessionToken } from "~/server/account.server";
import { siteConfig } from "~/server/config.server";
import { z } from "zod";
import type { AccountPage } from "@statsify/contract";

/** The visitor's account, or null when they aren't logged in or their session ended. */
export const getAccount = createServerFn().handler(async (): Promise<{ loginEnabled: boolean; account: AccountPage | null }> => {
  const { discordClientId } = await siteConfig();
  const loginEnabled = discordClientId !== "";
  const session = sessionToken();
  if (!session) return { loginEnabled, account: null };

  try {
    return { loginEnabled, account: await rpcServerClient.account.get({ session }) };
  } catch (error) {
    if (error instanceof ORPCError && error.defined && error.code === "UNAUTHORIZED") return { loginEnabled, account: null };
    throw error;
  }
});

/** The account after a change, or null when the API refused it. Anything unexpected is thrown and reaches Sentry. */
async function act(call: (session: string) => Promise<AccountPage>): Promise<AccountPage | null> {
  const session = sessionToken();
  if (!session) return null;

  try {
    return await call(session);
  } catch (error) {
    if (error instanceof ORPCError && error.defined) return null;
    throw error;
  }
}

const ProfileInput = z.object({ uuid: z.string().regex(UUID_PATTERN) });

export const setPrimaryProfile = createServerFn({ method: "POST" })
  .validator(ProfileInput)
  .handler(({ data }) => act((session) => rpcServerClient.account.setPrimary({ session, uuid: data.uuid })));

export const unlinkProfile = createServerFn({ method: "POST" })
  .validator(ProfileInput)
  .handler(({ data }) => act((session) => rpcServerClient.account.unlink({ session, uuid: data.uuid })));

export const claimVerified = createServerFn({ method: "POST" }).handler(() =>
  act((session) => rpcServerClient.account.claimVerified({ session }))
);

export const dismissMoved = createServerFn({ method: "POST" }).handler(() =>
  act((session) => rpcServerClient.account.dismissMoved({ session }))
);
