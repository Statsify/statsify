/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { AccountPage } from "~/features/account/account-page";
import { DEFAULT_LOCALE } from "~/i18n/locales";
import { NO_STORE_EDGE } from "~/lib/cache";
import { createFileRoute } from "@tanstack/react-router";
import { createI18n } from "~/i18n/i18n";
import { getAccount } from "~/features/account/account-data";
import { localeData } from "~/lib/social-meta";

/** The visitor's own account: never cached anywhere, since every response is one visitor's. */
export const Route = createFileRoute("/{-$locale}/account")({
  validateSearch: (search: Record<string, unknown>): { login?: "failed" } => (search.login === "failed" ? { login: "failed" } : {}),
  loader: () => getAccount(),
  head: ({ matches }) => {
    const words = createI18n(DEFAULT_LOCALE, localeData(matches)?.resources ?? {});
    return { meta: [{ title: words.t("meta.account.title") }, { name: "robots", content: "noindex" }] };
  },
  headers: () => NO_STORE_EDGE,
  component: AccountRoute,
});

function AccountRoute() {
  const { loginEnabled, account } = Route.useLoaderData();
  const { login } = Route.useSearch();
  return <AccountPage loginEnabled={loginEnabled} account={account} loginFailed={login === "failed"} />;
}
