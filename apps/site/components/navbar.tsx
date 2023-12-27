/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import Image from "next/image";
import Link from "next/link";
import { forward } from "~/lib/util/forward";
import { twMerge } from "tailwind-merge";

export interface NavbarProps {
  className?: string;
}

// TODO: fix ring
export function Navbar({ className }: NavbarProps) {
  return <nav className={twMerge("bg-black/60 shadow-md p-4 flex justify-between items-center text-white w-full", className)}>
    <div className="font-bold text-4xl flex gap-3 items-center">
      <Image src="/logo.png" width={48} height={48} alt="Statsify Logo" unoptimized />
      Statsify
    </div>
    <div className="flex flex-row gap-6 items-center">
      <NavbarItem href="/premium" active>Premium</NavbarItem>
      <NavbarItem href="/player">Discord</NavbarItem>
      <NavbarItem href="/player">Bot</NavbarItem>
      { /* TODO: impl Account Dropdown */ }
      <Link href="/player">
        <div className="w-12 h-12 rounded-md bg-red"/>
      </Link>
    </div>
  </nav>;
}

const NavbarItem = forward<typeof Link, { active?: boolean }>(function NavbarItem({active=false,...props}, ref) {
  return <Link
    {...props}
    ref={ref}
    data-active={active}
    className="text-lg font-semibold transition duration-[200ms] hover:bg-white/25 px-4 py-2 rounded-xl ring-white ring-offset-4 outline-white/50 outline-offset-[-2px] data-[active=true]:bg-white/30 outline-2 data-[active=true]:outline focus-visible:ring"
  />;
});