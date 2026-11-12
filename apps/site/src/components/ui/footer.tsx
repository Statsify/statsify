/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Brand } from "~/components/icons/logo";
import { Discord } from "~/components/icons/discord";
import { Divider } from "./divider";
import { EmailLink } from "./email-link";
import { GitHub } from "~/components/icons/github";
import { Link } from "@tanstack/react-router";
import { Patreon } from "~/components/icons/patreon";
import { ReactNode } from "react";
import { Twitter } from "~/components/icons/twitter";
import { YouTube } from "~/components/icons/youtube";
import { useTranslation } from "react-i18next";

const LINK = "flex min-h-11 items-center hover:text-mc-white hover:underline";

export function Footer() {
  const { t, i18n } = useTranslation();
  const year = new Intl.DateTimeFormat(i18n.language, { year: "numeric" }).format(new Date());
  const email = t("footer.email");

  return (
    <footer className="text-white flex justify-center bg-blackify-950 p-8">
      <div className="w-container flex flex-col gap-8 md:gap-4 pb-8">
        <Divider className="opacity-10" />
        <div className="flex flex-col gap-4 md:flex-row md:justify-between items-center">
          <Link to="/{-$locale}" aria-label="Statsify">
            <Brand />
          </Link>
          <div className="flex gap-4">
            <IconContainer href="/youtube" label="YouTube">
              <YouTube className="drop-shadow-mc-1" />
            </IconContainer>
            <IconContainer href="/patreon" label="Patreon">
              <Patreon className="drop-shadow-mc-1" />
            </IconContainer>
            <IconContainer href="/discord" label="Discord">
              <Discord className="drop-shadow-mc-1" />
            </IconContainer>
            <IconContainer href="/github" label="GitHub">
              <GitHub className="drop-shadow-mc-1" />
            </IconContainer>
            <IconContainer href="/twitter" label="X (Twitter)">
              <Twitter className="drop-shadow-mc-1" />
            </IconContainer>
          </div>
        </div>
        <div className="flex flex-col gap-4 md:flex-row md:justify-between text-mc-1.5 text-mc-gray items-center text-center md:text-start">
          <div className="flex flex-col gap-1 text-balance">
            {/* The year comes from the clock, which can differ between the server and the browser on New Year. */}
            <p suppressHydrationWarning>{t("footer.copyright", { year })}</p>
            <p>{t("footer.affiliation")}</p>
            <p>{t("footer.mojang")}</p>
            <p>{t("footer.mojangApproval")}</p>
          </div>
          <div className="flex flex-wrap justify-center gap-x-4">
            <Link to="/{-$locale}/about" className={LINK}>{t("footer.about")}</Link>
            <Link to="/{-$locale}/privacy" className={LINK}>{t("footer.privacy")}</Link>
            <Link to="/{-$locale}/terms" className={LINK}>{t("footer.terms")}</Link>
            <EmailLink email={email} className={LINK} />
          </div>
        </div>
      </div>
    </footer>
  );
}

// Vanity paths are answered by the server with a 301, so they are plain anchors, not router links.
function IconContainer({ children, label, href }: { children: ReactNode; label: string; href: string }) {
  return (
    <a
      href={href}
      aria-label={label}
      className="flex size-11 items-center justify-center bg-black/50 shadow-[4px_4px_0_rgb(0_0_0_/_0.2)] transition-colors hover:bg-black/80"
    >
      {children}
    </a>
  );
}
