import type { ReactNode } from "react";

export function Command({children}:{children:ReactNode}) {
	return <span className="bg-black/60 border-black/70 p-2 border-2">{children}</span>
}		