/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { config } from "@statsify/util";

const DISCORD_API = "https://discord.com/api/v10";

export const applicationId = await config("discordBot.applicationId", { required: false });
export const clientSecret = await config("linkedRoles.clientSecret", { required: false });
export const redirectUri = await config("linkedRoles.redirectUri", { required: false });

export interface DiscordTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export const getAuthorizeUrl = (state: string) => {
  const params = new URLSearchParams({
    client_id: applicationId!,
    redirect_uri: redirectUri!,
    response_type: "code",
    scope: "identify role_connections.write",
    state,
  });

  return `https://discord.com/oauth2/authorize?${params}`;
};

export const exchangeCode = (code: string) =>
  requestTokens({ grant_type: "authorization_code", code, redirect_uri: redirectUri! });

export const refreshTokens = (refreshToken: string) =>
  requestTokens({ grant_type: "refresh_token", refresh_token: refreshToken });

// Revoking any token revokes the whole authorization, refresh token included
export const revokeToken = async (token: string) => {
  const response = await oauth("/oauth2/token/revoke", { token });

  if (!response.ok) throw new Error(`Discord token revoke failed with ${response.status}`);
};

export const discordRequest = async (
  method: "GET" | "PUT" | "DELETE",
  path: string,
  accessToken: string,
  body?: object
) => {
  const response = await fetch(`${DISCORD_API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(body && { "Content-Type": "application/json" }),
    },
    ...(body && { body: JSON.stringify(body) }),
  });

  if (!response.ok) throw new Error(`Discord ${method} ${path} failed with ${response.status}`);

  return response;
};

const requestTokens = async (grant: Record<string, string>): Promise<DiscordTokens | undefined> => {
  const response = await oauth("/oauth2/token", grant);

  // Discord answers invalid_grant for a used or expired code and a revoked refresh token
  if (response.status === 400) return;
  if (!response.ok) throw new Error(`Discord token request failed with ${response.status}`);

  return response.json() as Promise<DiscordTokens>;
};

// Discord's OAuth2 endpoints only accept form bodies
const oauth = (path: string, params: Record<string, string>) =>
  fetch(`${DISCORD_API}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: applicationId!, client_secret: clientSecret!, ...params }),
  });
