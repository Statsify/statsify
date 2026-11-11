/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type AccountResult, claimVerified, dismissMoved, setPrimaryProfile, unlinkProfile } from "./account-data";
import type { AccountPage as AccountData, AccountPageProfile } from "@statsify/contract";
import { BOX_GAP, Box, CELL, HEADING_BOX } from "~/components/ui/box";
import { Button } from "~/components/ui/button";
import { Discord } from "~/components/icons/discord";
import { Link, useRouter } from "@tanstack/react-router";
import { MinecraftText } from "~/components/ui/minecraft-text";
import { PageBackground } from "~/components/ui/background";
import { SkinBust, SkinHead } from "~/components/ui/skin";
import { cn } from "~/lib/util";
import { dashedUuid } from "~/lib/uuid";
import { dateFormat } from "~/features/guild/guild-page";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export function AccountPage({
  loginEnabled,
  account,
  loginFailed,
}: {
  loginEnabled: boolean;
  account: AccountData | null;
  loginFailed: boolean;
}) {
  const { t } = useTranslation();

  return (
    <div className="relative grow">
      <PageBackground background="general" />
      <div className="w-container flex flex-col items-center px-4 py-8 text-mc-white md:px-8 md:py-12">
        <div className={cn("flex w-full max-w-200 flex-col", BOX_GAP)}>
          <Box className={HEADING_BOX}>
            <h1 className="text-mc-2 lg:text-mc-3 font-bold">{t("account.title")}</h1>
          </Box>
          {account ? <LoggedIn initial={account} /> : <LoggedOut loginEnabled={loginEnabled} failed={loginFailed} />}
        </div>
      </div>
    </div>
  );
}

function LoggedOut({ loginEnabled, failed }: { loginEnabled: boolean; failed: boolean }) {
  const { t } = useTranslation();

  return (
    <Box className={cn(CELL, "content:flex-col content:gap-4 content:py-6 content:text-center")}>
      <p className="text-mc-1.5 sm:text-mc-2 text-mc-gray">{t("account.loggedOut.description")}</p>
      {failed && <p className="text-mc-1.5 text-mc-red">{t("account.loggedOut.failed")}</p>}
      {loginEnabled ?
        // A server route that redirects to Discord, so a plain anchor rather than a router link.
        <Button variant="primary" className="content:bg-discord-500 w-full sm:w-auto sm:min-w-64" asChild>
          <a href="/auth/discord">
            <Discord className="drop-shadow-mc-1" />
            {t("account.loggedOut.discord")}
          </a>
        </Button> :
        <p className="text-mc-1.5 text-mc-gray">{t("account.loggedOut.unavailable")}</p>}
    </Box>
  );
}

function LoggedIn({ initial }: { initial: AccountData }) {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const [account, setAccount] = useState(initial);
  // A reload (`router.invalidate`) hands down a new account, which replaces the one the last change returned.
  const [loaded, setLoaded] = useState(initial);
  if (loaded !== initial) {
    setLoaded(initial);
    setAccount(initial);
  }
  const [pending, setPending] = useState(false);
  const [chosen, setChosen] = useState<string>();

  const primary = account.profiles.find((profile) => profile.primary);
  const selected = account.profiles.find((profile) => profile.uuid === chosen) ?? primary ?? account.profiles[0];

  const run = async (action: () => Promise<AccountResult>) => {
    setPending(true);

    try {
      const result = await action();
      if (result.ok) return setAccount(result.account);
      // The session ended, or the account changed since the page loaded (another tab, a claim): show it as it is now.
      await router.invalidate();
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      {account.moved.length > 0 && (
        <Box title={<h2 className="text-mc-1.5 text-mc-gray">{t("account.moved.title")}</h2>}>
          <ul className="flex flex-col gap-1 text-mc-1.5">
            {account.moved.map((move) => (
              <li key={`${move.uuid}-${move.movedAt}`}>
                {t("account.moved.line", { name: move.username ?? dashedUuid(move.uuid), date: dateFormat(i18n.language).format(move.movedAt) })}
              </li>
            ))}
          </ul>
          <Button size="small" className="mx-auto mt-3 sm:w-40" asChild>
            <button type="button" disabled={pending} onClick={() => run(() => dismissMoved())}>
              {t("account.moved.dismiss")}
            </button>
          </Button>
        </Box>
      )}

      {selected ?
        <Box title={<h2 className="text-mc-1.5 text-mc-gray">{t("account.profiles.title")}</h2>}>
          {account.profiles.length > 1 && <ProfileSwitcher profiles={account.profiles} selected={selected.uuid} onSelect={setChosen} />}
          <ProfilePanel
            profile={selected}
            canUnlink={!selected.primary || account.profiles.length === 1}
            pending={pending}
            onPrimary={() => run(() => setPrimaryProfile({ data: { uuid: selected.uuid } }))}
            onUnlink={() => run(() => unlinkProfile({ data: { uuid: selected.uuid } }))}
          />
        </Box> :
        <Box className={cn(CELL, "content:flex-col content:gap-2 content:py-6 content:text-center")}>
          <p className="text-mc-1.5 sm:text-mc-2">{t("account.profiles.none")}</p>
        </Box>}

      <Box className={cn(CELL, "content:flex-col content:gap-3 content:py-4 content:text-center")}>
        <p className="text-mc-1.5 text-mc-gray">{t(selected ? "account.verify.another" : "account.verify.first")}</p>
        <Button size="small" className="w-full sm:w-48" asChild>
          <button type="button" disabled={pending} onClick={() => run(() => claimVerified())}>
            {t("account.verify.check")}
          </button>
        </Button>
      </Box>

      {/* A plain form, so logging out works before the page's scripts load. */}
      <form method="post" action="/auth/logout" className="self-center">
        <Button size="small" className="w-40" asChild>
          <button type="submit">{t("account.logout")}</button>
        </Button>
      </form>
    </>
  );
}

/** One login owns several profiles; the switcher picks the one the panel below acts on. */
function ProfileSwitcher({
  profiles,
  selected,
  onSelect,
}: {
  profiles: AccountPageProfile[];
  selected: string;
  onSelect: (uuid: string) => void;
}) {
  const { t } = useTranslation();

  return (
    <fieldset className="mb-4 flex flex-wrap justify-center gap-2">
      <legend className="sr-only">{t("account.profiles.switcher")}</legend>
      {profiles.map((profile) => (
        <button
          key={profile.uuid}
          type="button"
          aria-pressed={profile.uuid === selected}
          onClick={() => onSelect(profile.uuid)}
          className="flex min-h-11 items-center gap-2 bg-black/20 px-3 text-mc-1.5 hover:bg-white/10 focus-visible:focus-ring-inset aria-pressed:bg-white/15 aria-pressed:font-bold"
        >
          <SkinHead uuid={profile.uuid} stored size={20} className="shrink-0" />
          <span className="mc-crisp">{profile.username ?? dashedUuid(profile.uuid)}</span>
        </button>
      ))}
    </fieldset>
  );
}

function ProfilePanel({
  profile,
  canUnlink,
  pending,
  onPrimary,
  onUnlink,
}: {
  profile: AccountPageProfile;
  canUnlink: boolean;
  pending: boolean;
  onPrimary: () => void;
  onUnlink: () => void;
}) {
  const { t, i18n } = useTranslation();
  // Unlinking takes a second press, since it unclaims the page and, for the last profile, the bot's verification.
  const [confirming, setConfirming] = useState<string>();
  const confirm = confirming === profile.uuid;

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
      <SkinBust uuid={profile.uuid} className="h-40 w-24 shrink-0" />
      <div className="flex min-w-0 grow flex-col gap-2 text-mc-1.5">
        <p className="text-mc-2 wrap-anywhere">
          {profile.displayName ? <MinecraftText>{profile.displayName}</MinecraftText> : dashedUuid(profile.uuid)}
        </p>
        <p className={profile.primary ? "text-mc-green" : "text-mc-gray"}>
          {t(profile.primary ? "account.profiles.primary" : "account.profiles.secondary")}
        </p>
        <p className="text-mc-gray">
          {t("account.profiles.linked", { date: dateFormat(i18n.language).format(profile.linkedAt) })}
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {profile.username && (
            <Button size="small" className="w-full sm:w-auto sm:min-w-40" asChild>
              <Link to="/{-$locale}/player/$name" params={{ name: profile.username }}>
                {t("account.profiles.view")}
              </Link>
            </Button>
          )}
          {!profile.primary && (
            <Button size="small" variant="primary" className="w-full sm:w-auto sm:min-w-40" asChild>
              <button type="button" disabled={pending} onClick={onPrimary}>
                {t("account.profiles.makePrimary")}
              </button>
            </Button>
          )}
          <Button size="small" className="w-full sm:w-auto sm:min-w-40" asChild>
            <button
              type="button"
              disabled={pending || !canUnlink}
              onClick={() => {
                if (!confirm) return setConfirming(profile.uuid);
                setConfirming(undefined);
                onUnlink();
              }}
            >
              {t(confirm ? "account.profiles.confirmUnlink" : "account.profiles.unlink")}
            </button>
          </Button>
        </div>
        {!canUnlink && <p className="text-mc-1 text-mc-gray">{t("account.profiles.primaryLocked")}</p>}
      </div>
    </div>
  );
}
