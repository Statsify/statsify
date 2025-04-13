/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import Link from "next/link";
import { Discord } from "~/components/icons/discord";
import { GitHub } from "~/components/icons/github";
import { Logo } from "~/components/icons/logo";
import { Patreon } from "~/components/icons/patreon";
import { ReactNode } from "react";
import { Twitter } from "~/components/icons/twitter";
import { YouTube } from "~/components/icons/youtube";
import { Divider } from "./divider";

export function Footer() {
  return (
    <footer className="text-white flex justify-center p-8">
      <div className="w-full max-w-[1440px] flex flex-col gap-8 md:gap-4 pb-8">
        <Divider className="opacity-10" />
        <div className="flex flex-col gap-4 md:flex-row md:justify-between items-center">
          <div className="flex items-center gap-4">
            <Logo className="size-18" />
            <p className="text-mc-5 font-bold">
              <span className="text-[#D0EFFF]">S</span>
              <span className="text-[#7DC6FA]">t</span>
              <span className="text-[#2A9DF4]">a</span>
              <span className="text-[#2492E7]">t</span>
              <span className="text-[#1E86DA]">s</span>
              <span className="text-[#187BCD]">i</span>
              <span className="text-[#1571BF]">f</span>
              <span className="text-[#1167B1]">y</span>
            </p>
          </div>
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
        <div className="flex flex-col gap-4 md:flex-row md:justify-between text-mc-1.5 text-mc-white items-center">
          <p className="opacity-60">© {new Date().getFullYear()} Statsify. All Rights Reserved.</p>
          <div className="flex gap-4 **:opacity-60 **:hover:opacity-100  **:hover:underline **:transition-opacity">
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function IconContainer({ children, label, href }: { children: ReactNode; label: string; href: string }) {
  return (
    <Link href={href} aria-label={label} className="group">
      <div className="bg-black/50 flex items-center justify-center p-0.5 group-hover:-translate-y-[4px] transition-all shadow-[4px_4px_0_rgb(0_0_0_/_0.2)]">
        {children}
      </div>
    </Link>
  );
}
