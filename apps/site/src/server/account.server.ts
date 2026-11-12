/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { NO_STORE_EDGE } from "~/lib/cache";
import { SESSION_TTL_SECONDS, SessionSchema } from "@statsify/contract";
import { getCookie } from "@tanstack/react-start/server";
import { randomBytes } from "node:crypto";
import { siteConfig } from "./config.server";

const SESSION_COOKIE = "statsify_session";
const STATE_COOKIE = "statsify_login_state";
const STATE_PATH = "/auth/discord";
const STATE_MAX_AGE_SECONDS = 10 * 60;

/** Shaped like the API's session tokens, so `SessionSchema` checks the login's `state` too. */
export const randomToken = () => randomBytes(32).toString("base64url");

/** The visitor's session token, for the account procedures; the API decides whether it's still live. */
export function sessionToken(): string | undefined {
  return tokenCookie(SESSION_COOKIE);
}

export function loginState(): string | undefined {
  return tokenCookie(STATE_COOKIE);
}

// An edited cookie reads as none, rather than reaching the API and failing its validation.
function tokenCookie(name: string): string | undefined {
  const value = getCookie(name);
  return SessionSchema.safeParse(value).success ? value : undefined;
}

export async function discordCallbackUrl(): Promise<string> {
  const { publicUrl } = await siteConfig();
  return `${publicUrl}/auth/discord/callback`;
}

/** A redirect that's never cached and sets or clears the given cookies. */
export function redirect(location: string, cookies: string[]): Response {
  const headers = new Headers({ ...NO_STORE_EDGE, Location: location });
  for (const cookie of cookies) headers.append("Set-Cookie", cookie);
  return new Response(null, { status: 303, headers });
}

export const sessionCookie = (session: string) => cookie(SESSION_COOKIE, session, SESSION_TTL_SECONDS, "/");
export const clearSessionCookie = () => cookie(SESSION_COOKIE, "", 0, "/");
export const stateCookie = (state: string) => cookie(STATE_COOKIE, state, STATE_MAX_AGE_SECONDS, STATE_PATH);
export const clearStateCookie = () => cookie(STATE_COOKIE, "", 0, STATE_PATH);

/**
 * HttpOnly, so page scripts never see it. Lax sends it on the top-level GET back from Discord but not on another
 * site's POST, so nobody can act with it from elsewhere. Values are base64url and need no escaping.
 */
async function cookie(name: string, value: string, maxAge: number, path: string): Promise<string> {
  const { publicUrl } = await siteConfig();
  const attributes = [`${name}=${value}`, `Path=${path}`, `Max-Age=${maxAge}`, "HttpOnly", "SameSite=Lax"];
  if (publicUrl.startsWith("https:")) attributes.push("Secure");
  return attributes.join("; ");
}
