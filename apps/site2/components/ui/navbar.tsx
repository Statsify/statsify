/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { cn } from "~/lib/util";
import { Logo } from "~/components/icons/logo";
import { Menu } from "../icons/menu";

export interface NavbarProperties {
  className?: string;
  children?: ReactNode;
}

// TODO: tabIndex
export function Navbar({ className, children }: NavbarProperties) {
  const path = usePathname();

  return (
    <nav className={cn("absolute w-full flex items-center justify-between bg-black/60 p-2 z-99", className)}>
      <Link className="flex items-center gap-3 text-4xl font-bold" href="https://statsify.net">
        <Logo className="size-16 md:size-8" />
        <p className="hidden md:block text-mc-white text-mc-2">Statsify</p>
      </Link>
      <Menu className="size-12 md:hidden text-white/50" />
      {/* <div className="flex grow justify-center md:w-1/2 md:grow-0">{children}</div> */}
      <div className="hidden flex-row items-center justify-end md:flex md:w-1/4 md:gap-3">
        <NavbarItem href="/premium" path={path}>
          Premium
        </NavbarItem>
        <NavbarItem href="/discord" path={path}>
          Discord
        </NavbarItem>
        <NavbarItem href="/bot" path={path}>
          Bot
        </NavbarItem>
        <NavbarItem href="/bot" path={path}>
          Bingo
        </NavbarItem>
      </div>
    </nav>
  );
}

// Old STATSISITE NAVBAR STUFF::::
// https://github.com/Statsify/statsify/blob/feat/statsisite/apps/site/components/navbar.tsx
// https://github.com/Statsify/statsify/blob/feat/statsisite/apps/site/lib/util/forward.tsx
// const NavbarItem = forward<typeof Link, { path: string }>(function NavbarItem(
//   { path, href, ...properties },
//   reference
// ) {
//   return (
//     <Link
//       {...properties}
//       ref={reference}
//       href={href}
//       data-active={href === path}
//       className="rounded-xl py-2 text-lg font-semibold outline-2 outline-offset-[-2px] outline-white/50 transition duration-[200ms] hover:bg-white/25 focus-visible:underline data-[active=true]:bg-white/30 data-[active=true]:outline md:px-2 lg:px-4"
//     />
//   );
// });

function NavbarItem({ path, href, children }: { path: string; href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      data-active={href === path}
      className="text-mc-2 text-mc-white hover:bg-white/20 px-4 py-2 transition-colors opacity-80 hover:opacity-100"
    >
      {children}
    </Link>
  );
}
