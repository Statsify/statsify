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
import { NavigationProgress } from "~/components/navigation-progress";
import { I18nextProvider, useTranslation } from "react-i18next";
import { type LocaleData, getLocaleData } from "~/i18n/locale-data";
import { NotFound } from "~/components/not-found";
import { type AnyRouteMatch, type NotFoundRouteProps, Outlet, createFileRoute, isNotFound, notFound, redirect, useRouter } from "@tanstack/react-router";
import { type ReactNode, useEffect, useMemo } from "react";
import { createI18n } from "~/i18n/i18n";
import { canonicalLink, oembedLink, socialMeta } from "~/lib/social-meta";
import { startClientSentry } from "~/lib/sentry";

/**
 * Every page lives under the optional locale prefix. English is served unprefixed, so
 * `/en-US/...` redirects to the bare path; unknown prefixes are 404s.
 */
export const Route = createFileRoute("/{-$locale}")({
  beforeLoad: async ({ params, location }): Promise<{ locale: Locale }> => {
    const { locale } = params;

    if (locale === undefined) return { locale: DEFAULT_LOCALE };

    if (locale === DEFAULT_LOCALE) {
      const pathname = location.pathname.slice(`/${DEFAULT_LOCALE}`.length) || "/";
      throw redirect({ href: `${pathname}${location.searchStr}${location.hash ? `#${location.hash}` : ""}`, statusCode: 301 });
    }

    // The loader won't run, so the 404 brings the English layout's data along (see `LocaleNotFound`).
    if (!isSupportedLocale(locale)) throw notFound({ data: await getLocaleData({ data: { locale: DEFAULT_LOCALE } }) });

    return { locale };
  },
  loader: ({ context }) => getLocaleData({ data: { locale: context.locale } }),
  staleTime: Infinity,
  // Site-wide Open Graph defaults; pages with their own image (player, Bingo) override them. Only this route adds the
  // canonical link, so a page never has two.
  head: ({ loaderData, matches, match }) => {
    if (!loaderData) {
      // An unknown prefix's 404, which carries the English layout's data (see `LocaleNotFound`).
      const data = isNotFound(match.error) ? (match.error.data as LocaleData | undefined) : undefined;
      if (!data) return {};
      const words = createI18n(DEFAULT_LOCALE, data.resources);
      return { meta: [{ title: words.t("meta.notFound.page") }, { name: "description", content: words.t("notFound.description") }] };
    }
    // In English like every page's head, from the server's `site.json`.
    const description = createI18n(DEFAULT_LOCALE, loaderData.resources).t("meta.description");
    // An index route's pathname ends in a slash its URL doesn't have. The route's own segments come in its own
    // casing (`/Leaderboards` is `/leaderboards`), and a player's name in the stored one, since other casings redirect.
    const leaf: AnyRouteMatch | undefined = matches.at(-1);
    const path = (leaf?.pathname ?? "/").replace(/(.)\/$/, "$1");
    // A game page is also its mode, submode and period: its loader's deps, which the URL names only past the first.
    // Every other page is its path alone.
    const deps: Record<string, string | undefined> = leaf?.routeId === "/{-$locale}/player/$name/$game" ? leaf.loaderDeps : {};
    const query = new URLSearchParams(Object.entries(deps).filter((entry): entry is [string, string] => entry[1] !== undefined));
    // But a board's page past the first is its own `?page=` (counted from 1), however the URL picked it.
    const board = leaf?.routeId === "/{-$locale}/leaderboards/$field" ? (leaf.loaderData as { page?: { page: number } } | undefined)?.page : undefined;
    if (board && board.page > 0) query.set("page", String(board.page + 1));
    return {
      meta: [{ name: "description", content: description }, ...socialMeta({ origin: loaderData.origin, path, description, image: "/images/og-home.png" })],
      links: [oembedLink(loaderData.origin, path), canonicalLink(loaderData.origin, query.size > 0 ? `${path}?${query}` : path)],
    };
  },
  notFoundComponent: LocaleNotFound,
  component: LocaleLayout,
});

function LocaleLayout() {
  const { locale } = Route.useRouteContext();
  const data = Route.useLoaderData();

  return (
    <LocaleShell locale={locale} data={data}>
      <Outlet />
    </LocaleShell>
  );
}

/**
 * A 404 thrown by this route (an unknown locale prefix) replaces the layout, so it draws the layout itself from the
 * data the 404 carries. Unmatched paths under a known locale render inside the layout's outlet with no data, and the
 * child routes that throw `notFound()` have their own `notFoundComponent`, so both keep the header and footer.
 */
function LocaleNotFound({ data }: NotFoundRouteProps) {
  if (!data || typeof data !== "object" || !("resources" in data)) return <NotFound />;

  return (
    <LocaleShell locale={DEFAULT_LOCALE} data={data as LocaleData}>
      <NotFound />
    </LocaleShell>
  );
}

/**
 * The first stop for a keyboard, hidden until it has focus: it skips the header's eight links and the search. Focus
 * moves to `<main>` itself, so the next Tab starts on the page.
 */
function SkipLink() {
  const { t } = useTranslation();

  return (
    <a
      href="#main"
      onClick={(event) => {
        event.preventDefault();
        document.querySelector<HTMLElement>("#main")?.focus();
      }}
      className="sr-only bg-blackify-800 text-mc-1.5 text-mc-white focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-100 focus:px-4 focus:py-3"
    >
      {t("nav.skip")}
    </a>
  );
}

function LocaleShell({ locale, data, children }: { locale: Locale; data: LocaleData; children: ReactNode }) {
  const { resources, sentry } = data;
  const router = useRouter();

  const i18n = useMemo(() => createI18n(locale, resources), [locale, resources]);

  useEffect(() => startClientSentry(router, sentry), [router, sentry]);

  // Landing on another page moves focus to it, as the skip link does, so a screen reader reads the new page and the
  // next Tab starts there. A change of search only (a mode, a board's page) leaves focus where it is.
  useEffect(
    () =>
      router.subscribe("onRendered", ({ pathChanged }) => {
        if (pathChanged) document.querySelector<HTMLElement>("#main")?.focus({ preventScroll: true });
      }),
    [router]
  );

  return (
    <I18nextProvider i18n={i18n}>
      <NavigationProgress />
      <SkipLink />
      <Header />
      {/* A column that grows, as the body is, so a page's own `grow` still fills the window above the footer. */}
      <main id="main" tabIndex={-1} className="flex grow flex-col focus-ring-none">
        {children}
      </main>
      <Footer />
    </I18nextProvider>
  );
}
