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
 * A link-styled button in the nametag that opens and closes a panel under the page's header, at `size` (the player
 * page's match the socials beside them).
 */
export function PanelToggle({
  open,
  controls,
  onToggle,
  size = "text-mc-1",
  onIntent,
  children,
}: {
  open: boolean;
  controls: string;
  onToggle: () => void;
  size?: string;
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
      // The tap area reaches 10 px under the button: on a game page's phone header, the tap area of the Updated hint
      // 8 px above it takes the button's top 9 px.
      className={`relative flex min-h-11 min-w-11 items-center justify-center ${size} text-mc-yellow hover:underline after:absolute after:inset-x-0 after:top-0 after:-bottom-2.5`}
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

/**
 * Share and save: the page's own link and its card (the image Discord unfurls) to copy and download, or on phones to
 * send through the share sheet, and on the player page the UUID, dashed and undashed. Rendered only while open, so the
 * card loads only then.
 */
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
  // The page as it's open, mode and all.
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
 * The card as a file for the OS share sheet, on touch screens whose browser can share files (phones and tablets, not
 * desktops). Fetched when the panel opens, since a share sheet opened after a fetch in the click would lose the tap's
 * user activation in Safari. `null` elsewhere, until it loads, and if it fails.
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
