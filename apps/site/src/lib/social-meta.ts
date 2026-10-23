/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { DEFAULT_LOCALE } from "~/i18n/locales";
import { createI18n } from "~/i18n/i18n";
import { formatNumber } from "~/i18n/format";
import { plainText } from "~/components/ui/minecraft-text";
import type { AnyRouteMatch } from "@tanstack/react-router";
import type { LocaleData } from "~/i18n/locale-data";

export const SITE_NAME = "Statsify";

/** The size of the site's own unfurl images, `/images/og-*.png`. */
const STATIC_IMAGE_SIZE = { width: 1200, height: 630 };

/** Where Twitter's cards stop a description. */
const DESCRIPTION_MAX = 200;

/** About where search results cut a page's plain description. */
export const SEARCH_DESCRIPTION_MAX = 155;

/** A value in a preview: a number in the bot's format, or the API's formatted text without its codes. */
export const valueText = (value: number | string) =>
  typeof value === "number" ? formatNumber(value, DEFAULT_LOCALE) : plainText(value);

/** A stat in a description, "Wins 2,304". */
export const statText = (label: string, value: number | string, suffix = "") => `${label} ${valueText(value)}${suffix}`;

/**
 * A description of stats for previews that show text without the image: `lead` ("anrie's BedWars stats:") and the parts
 * joined with " · ", as many whole parts as fit in `max`, so it never ends mid-number. Empty when not one part fits.
 */
export function statsDescription(parts: string[], { lead, max = DESCRIPTION_MAX }: { lead?: string; max?: number } = {}): string {
  let text = "";

  for (const part of parts) {
    const next = text ? `${text} · ${part}` : part;
    if ((lead ? `${lead} ${next}` : next).length > max) break;
    text = next;
  }

  return lead && text ? `${lead} ${text}` : text;
}

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
  imageSize = image.startsWith("/images/og-") ? STATIC_IMAGE_SIZE : undefined,
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

/** A search page's tags (`/bingo`, `/player`): `meta.<key>`'s title and description, then its preview's. */
export function searchPageMeta(
  matches: ReadonlyArray<{ routeId: string; loaderData?: unknown }>,
  { key, path, image, noindex = false }: { key: string; path: string; image: string; noindex?: boolean }
) {
  const locale = localeData(matches);
  // In English, from the server's `site.json`.
  const words = createI18n(DEFAULT_LOCALE, locale?.resources ?? {});
  const title = words.t(`meta.${key}.title`);
  const description = words.t(`meta.${key}.description`);
  const origin = locale?.origin;

  return [
    { title },
    { name: "description", content: description },
    ...(noindex ? [{ name: "robots", content: "noindex" }] : []),
    ...(origin ? socialMeta({ origin, path, title, description, image }) : []),
  ];
}
