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
import { GitHub } from "~/components/icons/github";
import { Link } from "@tanstack/react-router";
import { Patreon } from "~/components/icons/patreon";
import { ReactNode } from "react";
import { Twitter } from "~/components/icons/twitter";
import { YouTube } from "~/components/icons/youtube";
import { useTranslation } from "react-i18next";

export function Footer() {
  const { t, i18n } = useTranslation();
  const year = new Intl.DateTimeFormat(i18n.language, { year: "numeric" }).format(new Date());
  const email = t("footer.email");

  return (
    <footer className="text-white flex justify-center p-8">
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
        <div className="flex flex-col gap-4 md:flex-row md:justify-between text-mc-1.5 text-mc-white items-center text-center">
          <div className="flex flex-col gap-1 opacity-60 text-balance">
            <p>{t("footer.copyright", { year })}</p>
            <p>{t("footer.affiliation")}</p>
            <p>{t("footer.mojang")}</p>
            <p>{t("footer.operator")}</p>
          </div>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 **:opacity-60 **:hover:opacity-100 **:hover:underline **:transition-opacity">
            <a href="/privacy">{t("footer.privacy")}</a>
            <a href="/terms">{t("footer.terms")}</a>
            <a href={`mailto:${email}`}>{email}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Vanity paths are answered by the server with a 301, so they are plain anchors, not router links.
function IconContainer({ children, label, href }: { children: ReactNode; label: string; href: string }) {
  return (
    <a href={href} aria-label={label} className="group">
      <div className="bg-black/50 flex items-center justify-center p-0.5 group-hover:-translate-y-[4px] transition-all shadow-[4px_4px_0_rgb(0_0_0_/_0.2)]">
        {children}
      </div>
    </a>
  );
}
