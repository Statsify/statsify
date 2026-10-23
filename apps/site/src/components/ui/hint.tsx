/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type FocusEvent, type PointerEvent, type ReactNode, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/** The tooltip's distance from what it explains and from the window's edges. */
const GAP = 8;

/**
 * The tooltip: the full text in white Minecraft 16 on the opaque panel colour with the panels' hard shadow, centred over
 * the element (under it when the window's top is too close) and kept inside the window. Screen readers skip it, since
 * the element carries the full text for them.
 */
function Tooltip({ text, anchor }: { text: string; anchor: DOMRect }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [left, setLeft] = useState<number>();
  const above = anchor.top > 6 * GAP;

  useLayoutEffect(() => {
    const width = ref.current?.offsetWidth ?? 0;
    const room = document.documentElement.clientWidth - width - GAP;
    setLeft(Math.max(GAP, Math.min(anchor.left + anchor.width / 2 - width / 2, room)));
  }, [anchor]);

  return createPortal(
    <span
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed z-100 bg-blackify-800 px-2 py-1 text-mc-1 whitespace-nowrap text-mc-white shadow-[4px_4px_0_rgb(0_0_0/0.84)]"
      style={{
        left,
        top: above ? anchor.top - GAP : anchor.bottom + GAP,
        translate: above ? "0 -100%" : undefined,
        visibility: left === undefined ? "hidden" : undefined,
      }}
    >
      {text}
    </span>,
    document.body
  );
}

/**
 * Shows `text` over an element (or the box `anchor` picks for it) while a mouse is on it or it has the keyboard's focus,
 * and on `toggle`. Spread `props` on the element and render `tooltip` beside it. It closes when the page scrolls under
 * it, on Escape, and on a tap elsewhere. Without `text` it does nothing.
 */
export function useHint(text: string | undefined, anchor: (element: HTMLElement) => Element = (element) => element) {
  const [shown, setShown] = useState<{ element: Element; anchor: DOMRect } | null>(null);
  const show = (target: HTMLElement) => {
    const element = anchor(target);
    setShown({ element, anchor: element.getBoundingClientRect() });
  };
  const hide = () => setShown(null);

  useEffect(() => {
    if (!shown) return;

    const close = () => setShown(null);
    const outside = (event: globalThis.PointerEvent) => {
      if (!shown.element.contains(event.target as Node)) close();
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    addEventListener("scroll", close, { capture: true, passive: true });
    addEventListener("resize", close);
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      removeEventListener("scroll", close, { capture: true });
      removeEventListener("resize", close);
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [shown]);

  return {
    props: text === undefined ?
      {} :
      {
        onPointerEnter: (event: PointerEvent<HTMLElement>) => event.pointerType === "mouse" && show(event.currentTarget),
        onPointerLeave: (event: PointerEvent<HTMLElement>) => event.pointerType === "mouse" && hide(),
        onFocus: (event: FocusEvent<HTMLElement>) => event.currentTarget.matches(":focus-visible") && show(event.currentTarget),
        onBlur: hide,
      },
    tooltip: text !== undefined && shown && <Tooltip text={text} anchor={shown.anchor} />,
    toggle: (element: HTMLElement) => (shown ? hide() : show(element)),
  };
}

/**
 * Shortened text with its full form for screen readers in its place. For text under a link, which owns the tap: the link
 * shows the full form with `useHint`. Without `full` it's the text.
 */
export function Spoken({ full, children }: { full?: string; children: ReactNode }) {
  if (full === undefined) return children;

  return (
    <>
      <span aria-hidden>{children}</span>
      <span className="sr-only">{full}</span>
    </>
  );
}

/**
 * Text the page shortens (an abbreviation, a number past a million) with its full form: screen readers read the full
 * form, and it shows in a tooltip on hover, on keyboard focus and on tap. Without `full` it's the text.
 */
export function Hint({ full, children }: { full?: string; children: ReactNode }) {
  const { props, tooltip, toggle } = useHint(full);
  // A mouse already showed it on hover, so its click mustn't toggle it off again.
  const pointer = useRef<string>(undefined);

  if (full === undefined) return children;

  return (
    <>
      <button
        type="button"
        // Browsers drop a button's text shadow; the Minecraft text keeps its own. The tap area reaches past the text, so
        // a finger can hit a 10 px abbreviation.
        className="relative cursor-help [text-shadow:inherit] after:absolute after:-inset-x-2 after:-inset-y-4"
        {...props}
        onPointerDown={(event) => (pointer.current = event.pointerType)}
        onClick={(event) => {
          if (pointer.current !== "mouse") toggle(event.currentTarget);
          pointer.current = undefined;
        }}
      >
        <Spoken full={full}>{children}</Spoken>
      </button>
      {tooltip}
    </>
  );
}
