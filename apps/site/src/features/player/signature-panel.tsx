/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Box } from "~/components/ui/box";
import { IMAGE_VARIANTS } from "@statsify/profiles/protocol";
import { LABEL, Snippet } from "./share-panel";
import { cn } from "~/lib/util";
import { compactUuid } from "~/lib/uuid";
import { getRouteApi } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import type { PlayerPage } from "@statsify/contract";

/** The help text is reading text, so it is Mona Sans. */
const HELP = "text-mc-1 text-mc-gray";

const localeRoute = getRouteApi("/{-$locale}");

const { width, height } = IMAGE_VARIANTS.sig;

/**
 * "Get signature": the live `/sig` image and the snippets that embed it, each with a copy
 * button. URLs are absolute from `site.publicUrl` (the locale loader), never from the request, so a
 * pasted snippet works anywhere.
 */
export function SignaturePanel({ page }: { page: PlayerPage }) {
  const { t } = useTranslation();
  const { origin } = localeRoute.useLoaderData();

  // The undashed UUID, so every snippet names the same URL (and one edge cache entry).
  const uuid = compactUuid(page.uuid) ?? page.uuid;
  const image = `${origin}/sig/${uuid}.png`;
  const profile = `${origin}/player/${page.username}`;
  const alt = t("player.signature.alt", { name: page.username });

  // The forum snippet is what most people want; the rest wait under "More Formats".
  const forum = `[URL=${profile}][IMG]${image}[/IMG][/URL]`;
  const more: [label: string, text: string][] = [
    [t("player.signature.url"), image],
    [t("player.signature.markdown"), `[![${alt}](${image})](${profile})`],
    [t("player.signature.html"), `<a href="${profile}"><img src="${image}" alt="${alt}" width="${width}" height="${height}"></a>`],
    [t("player.signature.card"), `${origin}/card/${uuid}.png`],
  ];

  return (
    <Box
      title={<h2 className="text-mc-1.5">{t("player.signature.title")}</h2>}
      className="content:flex content:flex-col content:gap-4"
    >
      <p className={HELP}>{t("player.signature.description")}</p>
      <img
        src={`/sig/${uuid}.png`}
        alt={alt}
        width={width}
        height={height}
        loading="lazy"
        decoding="async"
        className="h-auto max-w-full self-center"
      />
      <dl>
        <Snippet label={t("player.signature.bbcode")} text={forum} />
      </dl>
      <details className="group">
        <summary className={cn(LABEL, "flex min-h-11 cursor-pointer list-none items-center gap-2 select-none [&::-webkit-details-marker]:hidden")}>
          <span aria-hidden className="text-mc-1 text-mc-gray group-open:rotate-90">{">"}</span>
          {t("player.signature.more")}
        </summary>
        <dl className="flex flex-col gap-3 pt-2">
          {more.map(([label, text]) => (
            <Snippet key={label} label={label} text={text} />
          ))}
        </dl>
      </details>
    </Box>
  );
}
