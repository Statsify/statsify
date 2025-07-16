/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import localFont from "next/font/local";
import { Footer } from "~/components/ui/footer";
import { env } from "./env";
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL(
    env.ENVIRONMENT === "production"
      ? "https://statsify-git-feat-sitev2-statsify-net.vercel.app"
      : "http://localhost:5000"
  ),
  title: "Statsify",
  description: "",
  icons: "../public/logos/logo_64.png",
};

const MinecraftFont = localFont({
  src: [
    { style: "Regular", weight: "400", path: "../public/fonts/Minecraft.ttf" },
    {
      style: "Bold",
      weight: "600",
      path: "../public/fonts/Minecraft Bold.ttf",
    },
    {
      style: "Italic",
      weight: "400",
      path: "../public/fonts/Minecraft Italic.ttf",
    },
    {
      style: "Italic",
      weight: "600",
      path: "../public/fonts/Minecraft Bold Italic.ttf",
    },
  ],
  preload: true,
  variable: "--font-minecraft",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${MinecraftFont.variable} antialiased leading-[normal] h-screen flex flex-col bg-blackify-950`}
      >
        {children}
        <Footer />
      </body>
    </html>
  );
}
