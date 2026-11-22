/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { DEFAULT_LOCALE } from "~/i18n/locales";
import { createI18n } from "~/i18n/i18n";
import type { AnyRouteMatch } from "@tanstack/react-router";
import type { LocaleData } from "~/i18n/locale-data";

export const SITE_NAME = "Statsify";

export interface SocialMetaOptions {
  /** `https://statsify.net`; Open Graph URLs must be absolute. */
  origin: string;
  /** The page path, for `og:url`. */
  path: string;
  title?: string;
  description: string;
  /** Absolute, or a path on `origin`. */
  image: string;
  /** The image's size in pixels, for `og:image:width` and `og:image:height`. */
  imageSize?: { width: number; height: number };
  type?: "website" | "profile";
}

type Meta = NonNullable<AnyRouteMatch["meta"]>;

/** Open Graph and Twitter card tags, the way Discord, Twitter and Slack unfurl a link. */
export function socialMeta({
  origin,
  path,
  title = SITE_NAME,
  description,
  image,
  imageSize,
  type = "website",
}: SocialMetaOptions): Meta {
  const url = new URL(path, origin).href;
  const imageUrl = new URL(image, origin).href;

  return [
    { property: "og:site_name", content: SITE_NAME },
    { property: "og:type", content: type },
    { property: "og:url", content: url },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: imageUrl },
    ...(imageSize ?
      [
        { property: "og:image:width", content: String(imageSize.width) },
        { property: "og:image:height", content: String(imageSize.height) },
      ] :
      []),
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: imageUrl },
  ];
}

/** oEmbed discovery, which gives Discord the "Statsify" provider line above the title. */
export function oembedLink(origin: string, path: string) {
  const url = new URL(path, origin).href;

  return {
    rel: "alternate",
    type: "application/json+oembed",
    href: `${origin}/oembed?${new URLSearchParams({ url, format: "json" })}`,
  };
}

/** The page's one canonical URL, as `og:url` builds it, so a link with `?utm=` or `?ref=` names the same page. */
export function canonicalLink(origin: string, path: string) {
  return { rel: "canonical", href: new URL(path, origin).href };
}

/** The locale layout's loader data from a `head()` context's `matches`, once the layout has loaded. */
export function localeData(matches: ReadonlyArray<{ routeId: string; loaderData?: unknown }>): LocaleData | undefined {
  const match = matches.find((candidate) => candidate.routeId === "/{-$locale}");
  return match?.loaderData as LocaleData | undefined;
}

/** A page's `meta.*` key in `site.json`, or its own words where they stay English in the code (privacy, terms). */
export type PageText = { key: string } | { title: string; description: string };

/** A page's tags: its title and description (in English, from the server's `site.json`), then its preview's. */
export function pageMeta(
  matches: ReadonlyArray<{ routeId: string; loaderData?: unknown }>,
  { path, image, noindex = false, ...text }: { path: string; image: string; noindex?: boolean } & PageText
) {
  const locale = localeData(matches);
  const words = createI18n(DEFAULT_LOCALE, locale?.resources ?? {});
  const title = "key" in text ? words.t(`meta.${text.key}.title`) : `${text.title} | ${SITE_NAME}`;
  const description = "key" in text ? words.t(`meta.${text.key}.description`) : text.description;
  const origin = locale?.origin;

  return [
    { title },
    { name: "description", content: description },
    ...(noindex ? [{ name: "robots", content: "noindex" }] : []),
    ...(origin ? socialMeta({ origin, path, title, description, image }) : []),
  ];
}
