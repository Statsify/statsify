/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { LoginDate } from "~/features/player/login-date";
import { cn } from "~/lib/util";
import { relativeTime } from "~/i18n/format";
import { useNow } from "~/features/player/refresh-bar";
import { useTranslation } from "react-i18next";

/** When the session started, and how old the stored player its numbers run to is. */
export function SessionLine({ start, updatedAt, className }: { start: number; updatedAt: number; className?: string }) {
  const { t, i18n } = useTranslation();
  const now = useNow();

  return (
    <p className={cn("text-mc-1.5 text-mc-gray", className)}>
      {t("session.started")} <LoginDate ms={start} />
      {now !== undefined && (
        // Its own line below `md`, where the two don't fit on one and the dot would end the first.
        <span className="max-md:block">
          <span className="max-md:hidden"> · </span>
          {t("player.updated", { time: relativeTime(updatedAt, now, i18n.language) })}
        </span>
      )}
    </p>
  );
}
