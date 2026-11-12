/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { DEFAULT_LOCALE, type Locale, isSupportedLocale } from "~/i18n/locales";
import { Footer } from "~/components/ui/footer";
import { Header } from "~/components/header";
import { I18nextProvider } from "react-i18next";
import { NotFound } from "~/components/not-found";
import { Outlet, createFileRoute, notFound, redirect, useRouter } from "@tanstack/react-router";
import { createI18n } from "~/i18n/i18n";
import { getLocaleData } from "~/i18n/locale-data";
import { startClientSentry } from "~/lib/sentry";
import { useEffect, useMemo } from "react";

/**
 * Every page lives under the optional locale prefix. English is served unprefixed, so
 * `/en-US/...` redirects to the bare path; unknown prefixes are 404s.
 */
export const Route = createFileRoute("/{-$locale}")({
  beforeLoad: ({ params, location }): { locale: Locale } => {
    const { locale } = params;

    if (locale === undefined) return { locale: DEFAULT_LOCALE };

    if (locale === DEFAULT_LOCALE) {
      const pathname = location.pathname.slice(`/${DEFAULT_LOCALE}`.length) || "/";
      throw redirect({ href: `${pathname}${location.searchStr}${location.hash ? `#${location.hash}` : ""}`, statusCode: 301 });
    }

    if (!isSupportedLocale(locale)) throw notFound();

    return { locale };
  },
  loader: ({ context }) => getLocaleData({ data: { locale: context.locale } }),
  staleTime: Infinity,
  notFoundComponent: NotFound,
  component: LocaleLayout,
});

function LocaleLayout() {
  const { locale } = Route.useRouteContext();
  const { resources, sentry } = Route.useLoaderData();
  const router = useRouter();

  const i18n = useMemo(() => createI18n(locale, resources), [locale, resources]);

  useEffect(() => startClientSentry(router, sentry), [router, sentry]);

  return (
    <I18nextProvider i18n={i18n}>
      <Header />
      <Outlet />
      <Footer />
    </I18nextProvider>
  );
}
