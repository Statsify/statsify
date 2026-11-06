/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Box } from "~/components/ui/box";
import { Button } from "~/components/ui/button";
import { Error, ErrorText } from "~/components/ui/error";
import { Skin } from "~/components/ui/skin";
import { Turnstile } from "~/components/turnstile";
import { formatCountdown } from "~/i18n/format";
import { isPlayerTag } from "~/lib/uuid";
import { getRouteApi, useNavigate, useParams } from "@tanstack/react-router";
import { type ActionResult, BROWSER_TIMEOUT_MS, lookupPlayer } from "./player-actions";
import { type ReactNode, useEffect, useState } from "react";
import { rememberPlayer } from "./resolve";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import type { PlayerIdentity } from "@statsify/contract";

const localeRoute = getRouteApi("/{-$locale}");

/** Steve, for players we have nothing to show yet. */
const PLACEHOLDER_UUID = "76a56ac7fcf649fca0531cb5c77cd9ae";

/** Looks a name up on Hypixel. The gallery passes its own outcomes, as it does for `RefreshBar`'s refresh. */
type Lookup<T = PlayerIdentity> = (name: string, token: string | undefined, deadline: AbortSignal) => Promise<ActionResult<T>>;

const lookupOnHypixel: Lookup = (name, token, deadline) => lookupPlayer({ data: { name, token }, signal: deadline });

/** The player-not-found page for the route's name. */
export function PlayerNotFound() {
  const { name = "" } = useParams({ strict: false });
  return <PlayerNotFoundView name={name} />;
}

/**
 * The player-not-found page with the Turnstile-gated "Look up on Hypixel" action. The header already has
 * the search, so the page has none of its own. On phones the skin is 160 px, so the button lands
 * mid-screen even when the 24 px copy takes three lines. Bingo, whose header has no search, passes its own
 * `search` (above the page, under it on phones) and its own action as `children`.
 */
export function PlayerNotFoundView({
  name,
  lookup,
  turnstileSiteKey,
  search,
  children,
}: { name: string; lookup?: Lookup; turnstileSiteKey?: string; search?: ReactNode; children?: ReactNode }) {
  const { t } = useTranslation();
  // A name no account can have has nothing to look up.
  const valid = isPlayerTag(name);

  return (
    <Error className={search ? "flex-col-reverse md:flex-col" : undefined}>
      {search}
      <div className="flex w-full max-w-160 flex-col items-center gap-4 self-center">
        <div className="flex max-w-full flex-col items-center gap-4">
          <Skin uuid={PLACEHOLDER_UUID} className="h-40 sm:h-64" />
          <Box className="max-w-full content:truncate">
            <span className="text-mc-dark-red">[</span>
            <span className="text-mc-red">???</span>
            <span className="text-mc-dark-red">]</span> {name}
          </Box>
        </div>
        <ErrorText heading={<h1 className="text-mc-3 lg:text-mc-4 text-mc-red font-bold">{t("player.notFound.title")}</h1>}>
          <p className="text-mc-1.5 sm:text-mc-2 text-mc-gray text-center">
            {t(valid ? "player.notFound.description" : "player.notFound.invalid", { name })}
          </p>
        </ErrorText>
        {valid && (children ?? <LookupButton name={name} lookup={lookup} turnstileSiteKey={turnstileSiteKey} />)}
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

/** `turnstileSiteKey` overrides config's (the gallery passes "" for no widget). */
export function LookupButton({ name, lookup = lookupOnHypixel, turnstileSiteKey }: { name: string; lookup?: Lookup; turnstileSiteKey?: string }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return (
    <HypixelLookup
      name={name}
      lookup={lookup}
      found={(identity) => {
        // The page it opens would otherwise find the "not found" it remembers for the name.
        rememberPlayer(queryClient, identity);
        return identity.username;
      }}
      unknown={t("player.notFound.unknown", { name })}
      turnstileSiteKey={turnstileSiteKey}
    />
  );
}

/**
 * The Turnstile-gated "Look up on Hypixel" button, for a player or a guild. A find opens the page asked for under the
 * name `found` hands back, Hypixel's spelling; `unknown` is what to say when Hypixel has nothing by that name.
 */
export function HypixelLookup<T>({
  name,
  lookup,
  found,
  unknown,
  turnstileSiteKey: siteKey,
}: {
  name: string;
  lookup: Lookup<T>;
  found: (data: T) => string;
  unknown: string;
  turnstileSiteKey?: string;
}) {
  const configured = localeRoute.useLoaderData().turnstileSiteKey;
  const turnstileSiteKey = siteKey ?? configured;
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [token, setToken] = useState<string>();
  const [widgetKey, setWidgetKey] = useState(0);
  const [widgetFailed, setWidgetFailed] = useState(false);
  // The widget's script loads on the first touch, hover or focus of the button, so a visitor who only reads the page
  // doesn't fetch it.
  const [wanted, setWanted] = useState(false);
  const want = () => setWanted(true);
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
  // Until the widget is wanted the button takes focus and presses, which load it.
  const disabled = state.status === "pending" || (wanted && needsToken) || remaining > 0;

  async function run() {
    setState({ status: "pending" });

    const deadline = AbortSignal.timeout(BROWSER_TIMEOUT_MS);
    const result = await lookup(name, token, deadline).catch(() => undefined);

    // Turnstile tokens are single-use: a fresh widget for the next attempt.
    setToken(undefined);
    setWidgetKey((key) => key + 1);

    // A 500, a Cloudflare 429 or a dropped connection; a hung one reads as Hypixel not answering.
    if (!result) {
      setState({ status: deadline.aborted ? "unavailable" : "error" });
      return;
    }

    if (result.ok) {
      // The page that was asked for (a game page keeps its game and mode) under the name Hypixel gave.
      const canonical = found(result.data);
      await navigate({ to: ".", params: (previous) => ({ ...previous, name: canonical }), search: true });
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
  // Without Cloudflare's script there's no token, so the button can't be pressed at all.
  if (widgetFailed) message = t("player.notFound.verifyFailed");
  else if (state.status === "unknown") message = unknown;
  else if (state.status === "unavailable") message = t("player.notFound.unavailable");
  else if (state.status === "verification") message = t("player.notFound.verify");
  else if (state.status === "error") message = t("player.notFound.error");
  else if (state.status === "limited" && remaining > 0) message = t("player.notFound.limited", { time: formatCountdown(remaining) });

  return (
    <div className="flex w-full max-w-100 flex-col items-center gap-3 self-center">
      {turnstileSiteKey && wanted && (
        <Turnstile key={widgetKey} siteKey={turnstileSiteKey} onToken={setToken} onLoadError={() => setWidgetFailed(true)} className="w-full" />
      )}
      <Button asChild variant="primary" className="w-full">
        <button
          type="button"
          disabled={disabled}
          onPointerEnter={want}
          onPointerDown={want}
          onFocus={want}
          onClick={() => {
            if (needsToken) want();
            else void run();
          }}
        >
          {state.status === "pending" ? t("player.notFound.lookingUp") : t("player.notFound.lookup")}
        </button>
      </Button>
      <output className="block text-mc-1 text-mc-red text-center empty:hidden">{message}</output>
    </div>
  );
}
