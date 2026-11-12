/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { cn } from "~/lib/util";
import { useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

/** How long a navigation may take before the bar shows; a quicker one just swaps the page. */
const DELAY_MS = 300;

/**
 * No route has a pending component, so the current page stays up until the next one's data is ready, and this bar is
 * the only sign of a slow navigation: it appears once one has taken longer than `DELAY_MS`.
 */
export function NavigationProgress() {
  const { t } = useTranslation();
  const pending = useRouterState({ select: (state) => state.status === "pending" });
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    if (!pending) return;
    const id = setTimeout(() => setSlow(true), DELAY_MS);
    return () => {
      clearTimeout(id);
      setSlow(false);
    };
  }, [pending]);

  return pending && slow ? <ProgressBar label={t("nav.loading")} /> : null;
}

/**
 * A 4 px white bar along the top of the window with a segment sliding across it; under reduced motion the whole bar
 * shows, still.
 */
export function ProgressBar({ label, className }: { label: string; className?: string }) {
  return (
    <div className={cn("fixed inset-x-0 top-0 z-200 h-1 overflow-hidden bg-white/20", className)}>
      {/* An indeterminate <progress> for assistive tech; the segment is what shows. */}
      <progress aria-label={label} className="sr-only" />
      <div aria-hidden className="h-full w-1/3 bg-mc-white motion-safe:animate-progress-slide motion-reduce:w-full" />
    </div>
  );
}
