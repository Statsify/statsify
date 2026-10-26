/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

/* eslint-disable jsx-a11y/prefer-tag-over-role -- a non-modal box floating in a portal; a `<dialog>` element would bring
   the browser's own position, margins and colours to undo. */

import { Floating, useDismiss } from "~/components/ui/hint";
import { Link, getRouteApi } from "@tanstack/react-router";
import { glossaryWordsQuery } from "~/features/content/content-data";
import { useEffect, useId, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useStatName } from "~/components/ui/stat";
import { useTranslation } from "react-i18next";

const localeRoute = getRouteApi("/{-$locale}");

/**
 * A stat cell's "?": what the stat is, for an abbreviation (FKDR) or a stat that means something else in this game. It
 * sits over the cell's top corner, beside its leaderboard link rather than in it, with a 44 px target, and opens on a
 * tap, a click or the keyboard, never on hover: the full name, the glossary's line (fetched the first time it opens,
 * since only the glossary and leaderboard pages carry the explanations) and a link to the entry. Escape, a tap
 * elsewhere, a scroll or Tab closes it, and Tab carries on from the "?".
 */
export function StatInfo({ glossary, label }: { glossary: string; label: string }) {
  const { t } = useTranslation();
  const id = useId();
  const button = useRef<HTMLButtonElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const [anchor, setAnchor] = useState<DOMRect | null>(null);
  const name = useStatName()(glossary) ?? label;
  const { glossaryHash } = localeRoute.useLoaderData();
  const words = useQuery({ ...glossaryWordsQuery(glossaryHash), enabled: anchor !== null, select: (words) => words[glossary] });

  useDismiss(anchor, (target) => !!(button.current?.contains(target) || box.current?.contains(target)), () => setAnchor(null));

  useEffect(() => {
    if (!anchor) return;
    // Next frame: the box stays hidden until it has measured where it fits, and a hidden box can't take focus.
    const frame = requestAnimationFrame(() => box.current?.focus({ preventScroll: true }));
    return () => cancelAnimationFrame(frame);
  }, [anchor]);

  return (
    <>
      <button
        ref={button}
        type="button"
        aria-expanded={anchor !== null}
        aria-controls={id}
        aria-label={t("game.about", { stat: label })}
        onClick={(event) => setAnchor(anchor ? null : (event.currentTarget.closest(".relative") ?? event.currentTarget).getBoundingClientRect())}
        // In the stat box's top corner, with its ring inside, as the box clips anything past its edge.
        className="absolute -top-2 -end-1 z-10 flex size-11 items-start justify-end p-1 text-mc-1 text-mc-gray hover:text-mc-white focus-visible:focus-ring-inset"
      >
        ?
      </button>
      {anchor && (
        <Floating
          ref={box}
          anchor={anchor}
          id={id}
          role="dialog"
          aria-label={name}
          tabIndex={-1}
          // Escape and Shift+Tab go back to the "?". Tab goes to the link, and past it on from the "?", as if the box sat
          // right after it.
          onKeyDown={(event) => {
            const onBox = event.target === event.currentTarget;
            if (event.key !== "Escape" && !(event.key === "Tab" && (event.shiftKey || !onBox))) return;
            if (event.key === "Escape" || event.shiftKey) event.preventDefault();
            setAnchor(null);
            button.current?.focus();
          }}
          className="flex w-72 max-w-[calc(100vw-16px)] flex-col gap-2 p-3 text-start outline-none"
        >
          <p className="text-mc-1 font-bold text-mc-white">{name}</p>
          {words.data?.text && <p className="font-sans text-16 font-medium text-mc-gray">{words.data.text}</p>}
          <Link to="/{-$locale}/glossary" hash={glossary} className="flex min-h-11 items-center text-mc-1 text-mc-yellow hover:underline">
            {t("leaderboards.glossary")}
          </Link>
        </Floating>
      )}
    </>
  );
}
