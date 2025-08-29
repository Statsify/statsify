/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { useEffect, useRef } from "react";

export function useOutisdeClick<T extends HTMLElement>(fn: () => void) {
  const ref = useRef<T>(null);

  useEffect(() => {
    function onClick(event: globalThis.PointerEvent) {
      if (event.target && ref.current && !ref.current.contains(event.target as Node)) {
        fn();
      }
    }

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [ref, fn]);

  return ref;
}
