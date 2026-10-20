/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Box } from "~/components/ui/box";
import { Button } from "~/components/ui/button";
import { IMAGE_VARIANTS } from "@statsify/profiles/protocol";
import { cn } from "~/lib/util";
import { compactUuid } from "~/lib/uuid";
import { getRouteApi } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { PlayerPage } from "@statsify/contract";

const LABEL = "text-mc-1 text-mc-white";
/** The help text is reading text, so it is Mona Sans. */
const HELP = "text-mc-1 text-mc-gray";
/** How long a copy button reads "Copied!". */
const COPIED_MS = 2000;

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

function Snippet({ label, text }: { label: string; text: string }) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(false), COPIED_MS);
    return () => clearTimeout(id);
  }, [copied]);

  // Without clipboard access (plain HTTP, old browsers) the field stays selectable, so nothing is reported.
  const copy = () => navigator.clipboard.writeText(text).then(() => setCopied(true), () => undefined);

  return (
    <div className="flex flex-col gap-1">
      <dt className={LABEL}>{label}</dt>
      <dd className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          readOnly
          value={text}
          aria-label={label}
          onFocus={(event) => event.currentTarget.select()}
          className="h-11 min-w-0 grow bg-blackify-800 px-3 text-mc-1 text-mc-white outline-none -outline-offset-2 focus:outline-2 focus:outline-white/60"
        />
        <Button asChild size="small" className="sm:min-w-32">
          <button type="button" onClick={copy}>
            {copied ? t("player.signature.copied") : t("player.signature.copy")}
          </button>
        </Button>
      </dd>
    </div>
  );
}
