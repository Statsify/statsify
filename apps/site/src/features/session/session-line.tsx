/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { LoginDate } from "~/features/player/login-date";
import { relativeTime } from "~/i18n/format";
import { useNow } from "~/features/player/refresh-bar";
import { useTranslation } from "react-i18next";

/** When the session started, and how old the stored player its numbers run to is. */
export function SessionLine({ start, updatedAt }: { start: number; updatedAt: number }) {
  const { t, i18n } = useTranslation();
  const now = useNow();

  return (
    <p className="text-mc-1.5 text-mc-gray">
      {t("session.started")} <LoginDate ms={start} />
      {now !== undefined && ` · ${t("player.updated", { time: relativeTime(updatedAt, now, i18n.language) })}`}
    </p>
  );
}
