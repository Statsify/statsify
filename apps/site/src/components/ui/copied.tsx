/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Floating } from "./hint";
import { useEffect, useState } from "react";

/** How long "Copied!" shows. */
const COPIED_MS = 1500;

/**
 * Copies text and keeps `mark` (the caller's own: a flag, or where to show "Copied!") for a moment once it worked.
 * `copy` resolves whether it did: pages served over plain HTTP have no clipboard, and a browser can refuse.
 */
export function useCopy<T>() {
  const [copied, setCopied] = useState<T>();

  useEffect(() => {
    if (copied === undefined) return;
    const id = setTimeout(() => setCopied(undefined), COPIED_MS);
    return () => clearTimeout(id);
  }, [copied]);

  const copy = async (text: string, mark: T) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      return false;
    }
    setCopied(() => mark);
    return true;
  };

  return [copied, copy] as const;
}

/** "Copied!" floating over what was copied. */
export function Copied({ anchor, children }: { anchor: DOMRect; children: string }) {
  return (
    <Floating anchor={anchor} className="pointer-events-none px-2 py-1 text-mc-1 whitespace-nowrap text-mc-white">
      {children}
    </Floating>
  );
}
