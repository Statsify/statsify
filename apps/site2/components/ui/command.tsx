import type { ReactNode } from "react";

export function Command({children}:{children:ReactNode}) {
	return <span className="bg-[oklab(0.57738_0.0140701_-0.208587)]/50 hover:bg-[oklab(0.57738_0.0140701_-0.208587)]/80 transition-colors
 py-1 px-1.5 border-2 border-[oklab(0.57738_0.0140701_-0.208587)]/50 text-[oklab(0.870541_0.00545415_-0.0617369)]">{children}</span>
}		