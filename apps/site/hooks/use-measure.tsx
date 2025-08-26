/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

"use client";

import { type RefObject, useEffect, useState } from "react";

export function useMeasure<T extends HTMLElement>(ref: RefObject<T | null>) {
  const [size, setSize] = useState({ width: 0, height: 0 });

  // This must check for window since ResizeObserver only exists on the web
  // eslint-disable-next-line unicorn/prefer-global-this
  const observer = typeof window !== "undefined" && window.ResizeObserver ? new ResizeObserver((entries) => setSize(entries[0].contentRect)) : undefined;

  useEffect(() => {
    if (!ref.current) return;
    observer?.observe(ref.current);
    return () => ref.current && observer?.unobserve(ref.current);
  }, [ref]);

  return size;
}
