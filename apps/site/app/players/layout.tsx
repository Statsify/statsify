import { Providers } from "./providers";

export default function PlayersLayout({ children }: LayoutProps<"/players">) {
  return <Providers>{children}</Providers>
}