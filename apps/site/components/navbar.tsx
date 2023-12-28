/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

"use client";

import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";
import { forward } from "~/lib/util/forward";
import { twMerge } from "tailwind-merge";
import { usePathname } from "next/navigation";

export interface NavbarProperties {
	className?: string;
	children?: ReactNode;
}

// TODO: tabIndex
export function Navbar({ className, children }: NavbarProperties) {
	const path = usePathname();

	return (
		<nav className={twMerge("bg-black/60 shadow-md p-4 flex items-center text-white w-full gap-8 md:gap-0 justify-center", className)}>
			<div className="grow md:w-1/4">
				<Link className="flex items-center gap-3 text-4xl font-bold" href="/">
					<Image src="/logo.png" width={48} height={48} alt="Statsify Logo" unoptimized />
					<p className="hidden md:block">Statsify</p>
				</Link>
			</div>
			<div className="flex grow justify-center md:w-1/2 md:grow-0">{children}</div>
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
				{/* TODO: impl Account Dropdown */}
				<Link href="/player">
					<div className="h-12 w-12 rounded-md bg-red" />
				</Link>
			</div>
		</nav>
	);
}

const NavbarItem = forward<typeof Link, { path: string }>(function NavbarItem({ path, href, ...properties }, reference) {
	return (
		<Link
			{...properties}
			ref={reference}
			href={href}
			data-active={href === path}
			className="rounded-xl py-2 text-lg font-semibold outline-2 outline-offset-[-2px] outline-white/50 transition duration-[200ms] hover:bg-white/25 focus-visible:underline data-[active=true]:bg-white/30 data-[active=true]:outline md:px-2 lg:px-4"
		/>
	);
});
