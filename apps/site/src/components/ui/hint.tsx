/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type ComponentProps, type FocusEvent, type PointerEvent, type ReactNode, useEffect, useEffectEvent, useLayoutEffect, useRef, useState } from "react";
import { cn } from "~/lib/util";
import { createPortal } from "react-dom";

/** The tooltip's distance from what it explains and from the window's edges. */
const GAP = 8;

/**
 * A box on the opaque panel colour with the panels' hard shadow, centred over `anchor` (under it when the window's top
 * leaves no room for it) and kept inside the window, in a portal so no panel's clipped corners cut it off.
 */
export function Floating({ anchor, className, style, ref: outer, ...props }: { anchor: DOMRect } & ComponentProps<"div">) {
  const ref = useRef<HTMLDivElement>(null);
  const [place, setPlace] = useState<{ left: number; above: boolean }>();

  useLayoutEffect(() => {
    const { offsetWidth: width = 0, offsetHeight: height = 0 } = ref.current ?? {};
    const room = document.documentElement.clientWidth - width - GAP;
    setPlace({
      left: Math.max(GAP, Math.min(anchor.left + anchor.width / 2 - width / 2, room)),
      above: anchor.top - height - GAP >= GAP,
    });
  }, [anchor]);
  const above = place?.above ?? true;

  return createPortal(
    <div
      {...props}
      ref={(element) => {
        ref.current = element;
        if (typeof outer === "function") outer(element);
        else if (outer) outer.current = element;
      }}
      className={cn("fixed z-100 bg-blackify-800 shadow-[4px_4px_0_rgb(0_0_0/0.84)]", className)}
      style={{
        ...style,
        left: place?.left,
        top: above ? anchor.top - GAP : anchor.bottom + GAP,
        translate: above ? "0 -100%" : undefined,
        visibility: place ? undefined : "hidden",
      }}
    />,
    document.body
  );
}

/**
 * The tooltip: the full text in white Minecraft 16, floating over the element. Screen readers skip it, since the
 * element carries the full text for them.
 */
function Tooltip({ text, anchor, ...props }: { text: string; anchor: DOMRect } & Pick<ComponentProps<"div">, "onPointerEnter" | "onPointerLeave">) {
  return (
    <Floating anchor={anchor} aria-hidden {...props} className="px-2 py-1 text-mc-1 whitespace-nowrap text-mc-white">
      {text}
    </Floating>
  );
}

/**
 * While `open` is set, closes a floating box when the page scrolls under it or resizes, on Escape, and on a press
 * outside what `inside` accepts.
 */
export function useDismiss(open: unknown, inside: (target: Node) => boolean, close: () => void) {
  const onClose = useEffectEvent(close);
  const onPress = useEffectEvent((event: globalThis.PointerEvent) => {
    if (!inside(event.target as Node)) close();
  });

  useEffect(() => {
    if (!open) return;

    const dismiss = () => onClose();
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    addEventListener("scroll", dismiss, { capture: true, passive: true });
    addEventListener("resize", dismiss);
    document.addEventListener("pointerdown", onPress);
    document.addEventListener("keydown", escape);
    return () => {
      removeEventListener("scroll", dismiss, { capture: true });
      removeEventListener("resize", dismiss);
      document.removeEventListener("pointerdown", onPress);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);
}

/** How long a tooltip stays after the mouse leaves its element: long enough to cross the gap onto the tooltip. */
const LEAVE_MS = 150;

/**
 * Shows `text` over an element (or the box `anchor` picks for it) while a mouse is on it or on the tooltip, or it has
 * the keyboard's focus, and on `toggle`. Spread `props` on the element and render `tooltip` beside it. It closes when
 * the page scrolls under it, on Escape, and on a tap elsewhere. Without `text` it does nothing.
 */
export function useHint(text: string | undefined, anchor: (element: HTMLElement) => Element = (element) => element) {
  const [shown, setShown] = useState<{ element: Element; anchor: DOMRect } | null>(null);
  const leaving = useRef<ReturnType<typeof setTimeout>>(undefined);
  const show = (target: HTMLElement) => {
    clearTimeout(leaving.current);
    const element = anchor(target);
    setShown({ element, anchor: element.getBoundingClientRect() });
  };
  const hide = () => {
    clearTimeout(leaving.current);
    setShown(null);
  };
  const leave = () => {
    clearTimeout(leaving.current);
    leaving.current = setTimeout(() => setShown(null), LEAVE_MS);
  };

  useEffect(() => () => clearTimeout(leaving.current), []);

  useDismiss(shown, (target) => !!shown?.element.contains(target), () => setShown(null));

  return {
    props: text === undefined ?
      {} :
      {
        onPointerEnter: (event: PointerEvent<HTMLElement>) => event.pointerType === "mouse" && show(event.currentTarget),
        onPointerLeave: (event: PointerEvent<HTMLElement>) => event.pointerType === "mouse" && leave(),
        onFocus: (event: FocusEvent<HTMLElement>) => event.currentTarget.matches(":focus-visible") && show(event.currentTarget),
        onBlur: hide,
      },
    tooltip: text !== undefined && shown && (
      <Tooltip text={text} anchor={shown.anchor} onPointerEnter={() => clearTimeout(leaving.current)} onPointerLeave={leave} />
    ),
    toggle: (element: HTMLElement) => (shown ? hide() : show(element)),
  };
}

/**
 * Text that says "Tap" on a touch screen and "Click" with a mouse. Both are in the HTML, so the server's render and the
 * browser's agree; the pointer media query shows one.
 */
export function PointerText({ mouse, touch }: { mouse: ReactNode; touch: ReactNode }) {
  return (
    <>
      <span className="pointer-coarse:hidden">{mouse}</span>
      <span className="hidden pointer-coarse:inline">{touch}</span>
    </>
  );
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
export function Hint({
  full,
  spoken = full,
  children,
}: {
  full?: string;
  /** What screen readers read in the text's place when it isn't `full`: a date keeps itself and adds how long ago. */
  spoken?: string;
  children: ReactNode;
}) {
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
        <Spoken full={spoken}>{children}</Spoken>
      </button>
      {tooltip}
    </>
  );
}
