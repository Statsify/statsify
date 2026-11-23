/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Box } from "~/components/ui/box";
import { Button } from "~/components/ui/button";
import { dashedUuid } from "~/lib/uuid";
import { getRouteApi, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useCopy } from "~/components/ui/copied";
import { useTranslation } from "react-i18next";
import type { ReactNode } from "react";

export const LABEL = "text-mc-1 text-mc-white";

const localeRoute = getRouteApi("/{-$locale}");

/**
 * A button in the nametag that opens and closes a panel under the page's header, in the Update stats button's fill and
 * height. Its tap area reaches past its 32 px box to 44 px.
 */
export function PanelToggle({
  open,
  controls,
  onToggle,
  onIntent,
  children,
}: {
  open: boolean;
  controls: string;
  onToggle: () => void;
  /** When a pointer or the keyboard reaches it, to start loading what it opens. */
  onIntent?: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-expanded={open}
      aria-controls={controls}
      onClick={onToggle}
      onPointerEnter={onIntent}
      onFocus={onIntent}
      className="relative flex h-8 min-w-8 shrink-0 items-center justify-center bg-blackify-800 px-3 text-mc-1 text-mc-yellow after:absolute after:-inset-1.5 hover:bg-blackify-700 focus-visible:focus-ring-inset"
    >
      {children}
    </button>
  );
}

/** Brings a panel that just opened into view: on a phone it opens below the screen, where nothing shows it opened. */
export function useRevealOnOpen(id: string) {
  // A block, not an expression: newer browsers' scrollIntoView returns a promise, which React would call as the cleanup
  // when the panel closes.
  useEffect(() => {
    document.querySelector(`#${CSS.escape(id)}`)?.scrollIntoView({ block: "nearest" });
  }, [id]);
}

/** The page's link and its card (the image Discord unfurls) to copy, save or share, and the player's UUID where given. */
export function SharePanel({
  id,
  name,
  card,
  file,
  uuid,
}: {
  id: string;
  name: string;
  /** The card's URL and size. */
  card: { src: string; width: number; height: number };
  /** The downloaded card's file name. */
  file: string;
  uuid?: string;
}) {
  const { t } = useTranslation();
  const { origin } = localeRoute.useLoaderData();
  useRevealOnOpen(id);
  const href = useLocation({ select: (location) => location.href });
  const link = `${origin}${href}`;
  const shareable = useShareableCard(card.src, file);

  // Closing the share sheet rejects too, so a rejection isn't reported.
  const share = (cardFile: File) => {
    navigator.share({ files: [cardFile], url: link }).catch(() => undefined);
  };

  return (
    <Box id={id} title={<h2 className="text-mc-1.5">{t("player.share.title")}</h2>} className="content:flex content:flex-col content:gap-4">
      <dl className="flex flex-col gap-3">
        <Snippet label={t("player.share.link")} text={link} />
        {uuid && (
          <>
            <Snippet label={t("player.share.uuid")} text={dashedUuid(uuid)} />
            <Snippet label={t("player.share.uuidCompact")} text={uuid} />
          </>
        )}
      </dl>
      <img
        src={card.src}
        alt={t("player.signature.alt", { name })}
        width={card.width}
        height={card.height}
        decoding="async"
        className="h-auto max-w-full self-center"
      />
      <Button asChild className="self-center sm:min-w-48">
        <a href={card.src} download={file}>
          {t("player.share.save")}
        </a>
      </Button>
      {shareable && (
        <Button asChild className="self-center sm:min-w-48">
          <button type="button" onClick={() => share(shareable)}>
            {t("player.share.send")}
          </button>
        </Button>
      )}
    </Box>
  );
}

/**
 * The card as a file for a touch screen's share sheet, or `null`. Fetched when the panel opens: a share sheet opened
 * after a fetch in the click would lose the tap's user activation in Safari.
 */
function useShareableCard(src: string, file: string) {
  const [shareable, setShareable] = useState<File | null>(null);

  useEffect(() => {
    if (!navigator.canShare || !matchMedia("(pointer: coarse)").matches) return;
    let current = true;
    const load = async () => {
      const response = await fetch(src);
      if (!response.ok) return;
      const blob = await response.blob();
      const cardFile = new File([blob], file, { type: blob.type });
      if (current && navigator.canShare({ files: [cardFile] })) setShareable(cardFile);
    };
    load().catch(() => undefined);
    return () => {
      current = false;
    };
  }, [src, file]);

  return shareable;
}

/**
 * A labeled text to copy: the text in a read-only field and a Copy button that says "Copied!" for a moment. Here
 * rather than in the signature panel, which game pages (and so every page's first load) would then carry.
 */
export function Snippet({ label, text }: { label: string; text: string }) {
  const { t } = useTranslation();
  // Without clipboard access (plain HTTP, old browsers) the field stays selectable, so nothing is reported.
  const [copied, copy] = useCopy<true>();

  return (
    <div className="flex flex-col gap-1">
      <dt className={LABEL}>{label}</dt>
      <dd className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          readOnly
          value={text}
          aria-label={label}
          onFocus={(event) => event.currentTarget.select()}
          className="h-11 min-w-0 grow bg-blackify-800 px-3 text-mc-1 text-mc-white focus:focus-ring-inset"
        />
        <Button asChild size="small" className="sm:min-w-32">
          <button type="button" onClick={() => void copy(text, true)}>
            {copied ? t("player.signature.copied") : t("player.signature.copy")}
          </button>
        </Button>
        <output className="sr-only">{copied && t("player.signature.copied")}</output>
      </dd>
    </div>
  );
}
