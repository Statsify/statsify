/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Box } from "~/components/ui/box";
import { Button } from "~/components/ui/button";
import { Error } from "~/components/ui/error";
import { Search } from "~/components/search";
import { Skin } from "~/components/ui/skin";
import { Turnstile } from "~/components/turnstile";
import { cn } from "~/lib/util";
import { getRouteApi, useNavigate, useParams } from "@tanstack/react-router";
import { lookupPlayer } from "./player-actions";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const localeRoute = getRouteApi("/{-$locale}");

/** Steve, for players we have nothing to show yet. */
const PLACEHOLDER_UUID = "76a56ac7fcf649fca0531cb5c77cd9ae";

/** The player-not-found page with the Turnstile-gated "Look up on Hypixel" action. */
export function PlayerNotFound() {
  const { name = "" } = useParams({ strict: false });
  const { t } = useTranslation();

  return (
    <Error className="gap-8 flex-col-reverse px-8 md:flex-col">
      <Search key={name} className="w-full max-w-200" defaultValue={name} />
      <div className="flex flex-col items-center justify-center gap-4 text-center">
        <Box>
          <span className="text-mc-dark-red">[</span>
          <span className="text-mc-red">???</span>
          <span className="text-mc-dark-red">]</span> {name}
        </Box>
        <Skin uuid={PLACEHOLDER_UUID} className="h-64" />
        <h1 className="text-mc-4 lg:text-mc-7 text-mc-red font-bold">{t("player.notFound.title")}</h1>
        <p className="max-w-200 text-20 lg:text-24 font-medium text-mc-gray">{t("player.notFound.description", { name })}</p>
        {name && <LookupButton name={name} />}
      </div>
    </Error>
  );
}

type LookupState =
  | { status: "idle" }
  | { status: "pending" }
  | { status: "unknown" }
  | { status: "unavailable" }
  | { status: "verification" }
  | { status: "error" }
  | { status: "limited"; until: number };

function LookupButton({ name }: { name: string }) {
  const { turnstileSiteKey } = localeRoute.useLoaderData();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [token, setToken] = useState<string>();
  const [widgetKey, setWidgetKey] = useState(0);
  const [state, setState] = useState<LookupState>({ status: "idle" });
  const [now, setNow] = useState<number>();

  useEffect(() => {
    if (state.status !== "limited") return;
    const { until } = state;
    // Once a second until the wait is over, then no more renders while the page stays open.
    const tick = () => {
      const time = Date.now();
      setNow(time);
      if (time >= until) clearInterval(id);
    };
    const id = setInterval(tick, 1000);
    tick();
    return () => clearInterval(id);
  }, [state]);

  const remaining =
    state.status === "limited" && now !== undefined ? Math.max(0, Math.ceil((state.until - now) / 1000)) : 0;
  const needsToken = turnstileSiteKey !== "" && token === undefined;
  const disabled = state.status === "pending" || needsToken || remaining > 0;

  async function lookup() {
    setState({ status: "pending" });

    const result = await lookupPlayer({ data: { name, token } }).catch(() => undefined);

    // Turnstile tokens are single-use: a fresh widget for the next attempt.
    setToken(undefined);
    setWidgetKey((key) => key + 1);

    // A 500, a Cloudflare 429 or a dropped connection.
    if (!result) {
      setState({ status: "error" });
      return;
    }

    if (result.ok) {
      // The page that was asked for (a game page keeps its game and mode) under the name Hypixel gave.
      await navigate({ to: ".", params: (previous) => ({ ...previous, name: result.data.username }), search: true });
      return;
    }

    if (result.code === "TOO_MANY_REQUESTS") {
      setState({ status: "limited", until: Date.now() + result.retryAfter * 1000 });
      return;
    }

    if (result.code === "NOT_FOUND") setState({ status: "unknown" });
    else if (result.code === "UNAVAILABLE") setState({ status: "unavailable" });
    else setState({ status: "verification" });
  }

  let message: string | undefined;
  if (state.status === "unknown") message = t("player.notFound.unknown", { name });
  else if (state.status === "unavailable") message = t("player.notFound.unavailable");
  else if (state.status === "verification") message = t("player.notFound.verify");
  else if (state.status === "error") message = t("player.notFound.error");
  else if (state.status === "limited" && remaining > 0) message = t("player.notFound.limited", { seconds: remaining });

  return (
    <div className="flex w-full max-w-100 flex-col items-center gap-3">
      {turnstileSiteKey && <Turnstile key={widgetKey} siteKey={turnstileSiteKey} onToken={setToken} className="w-full" />}
      <Button asChild className={cn("w-full", disabled && "opacity-60")}>
        <button type="button" disabled={disabled} onClick={() => void lookup()}>
          {state.status === "pending" ? t("player.notFound.lookingUp") : t("player.notFound.lookup")}
        </button>
      </Button>
      {message && <p className="text-16 font-medium text-mc-red">{message}</p>}
    </div>
  );
}
