/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { useEffect, useRef } from "react";

interface TurnstileApi {
  render(
    container: HTMLElement,
    options: {
      sitekey: string;
      theme?: "light" | "dark" | "auto";
      size?: "normal" | "flexible" | "compact";
      callback: (token: string) => void;
      "expired-callback"?: () => void;
      "error-callback"?: () => void;
    }
  ): string;
  remove(widgetId: string): void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

let loading: Promise<TurnstileApi> | undefined;

function loadTurnstile(): Promise<TurnstileApi> {
  loading ??= new Promise((resolve, reject) => {
    if (window.turnstile) {
      resolve(window.turnstile);
      return;
    }

    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.addEventListener("load", () => {
      if (window.turnstile) resolve(window.turnstile);
      else reject(new Error("Turnstile loaded without its API"));
    });
    script.addEventListener("error", () => reject(new Error("Turnstile failed to load")));
    document.head.append(script);
  });

  return loading;
}

/**
 * Cloudflare's Turnstile widget, loaded on demand. `onToken` receives the token once the visitor
 * passes, and `undefined` when it expires or the widget fails. Remount (change `key`) after using a token.
 */
export function Turnstile({
  siteKey,
  onToken,
  className,
}: {
  siteKey: string;
  onToken: (token: string | undefined) => void;
  className?: string;
}) {
  const container = useRef<HTMLDivElement>(null);
  const callback = useRef(onToken);

  useEffect(() => {
    callback.current = onToken;
  }, [onToken]);

  useEffect(() => {
    const element = container.current;
    if (!element) return;

    let cancelled = false;
    let widgetId: string | undefined;

    async function mount(target: HTMLElement) {
      try {
        const turnstile = await loadTurnstile();
        if (cancelled) return;

        widgetId = turnstile.render(target, {
          sitekey: siteKey,
          theme: "dark",
          size: "flexible",
          callback: (token) => callback.current(token),
          "expired-callback": () => callback.current(undefined),
          "error-callback": () => callback.current(undefined),
        });
      } catch {
        callback.current(undefined);
      }
    }

    void mount(element);

    return () => {
      cancelled = true;
      if (widgetId) window.turnstile?.remove(widgetId);
    };
  }, [siteKey]);

  return <div ref={container} className={className} />;
}
