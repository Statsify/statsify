/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Link } from "@tanstack/react-router";
import { NO_PROFILE, onAccountHintChange, readAccountHint } from "~/lib/account-hint";
import { SkinHead } from "~/components/ui/skin";
import { cn } from "~/lib/util";
import { useSyncExternalStore } from "react";
import { useTranslation } from "react-i18next";

const CELL = "col-start-1 row-start-1";

/**
 * The header's way to `/account`: the logged-in visitor's head, or Log In. The server renders it empty, since the page
 * is cached for everyone; the browser fills it in from the account hint. Every state takes the same cell, sized to the
 * widest, so the header doesn't move when it does.
 */
export function AccountLink({ className }: { className?: string }) {
  const { t } = useTranslation();
  const hint = useSyncExternalStore(onAccountHintChange, readAccountHint, () => undefined);
  const label = hint ? t("nav.account") : t("nav.login");

  return (
    <Link to="/{-$locale}/account" aria-label={hint === undefined ? t("nav.account") : label} className={className}>
      <span className="grid items-center justify-items-center">
        <span aria-hidden className={cn(CELL, "invisible")}>{t("nav.login")}</span>
        <span aria-hidden className={cn(CELL, "invisible")}>{t("nav.account")}</span>
        {hint !== undefined && (
          hint && hint !== NO_PROFILE ?
            <SkinHead uuid={hint} stored size={24} className={CELL} /> :
            <span aria-hidden className={CELL}>{label}</span>
        )}
      </span>
    </Link>
  );
}
