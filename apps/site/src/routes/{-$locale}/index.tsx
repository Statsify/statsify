/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Background } from "~/components/ui/background";
import { Box } from "~/components/ui/box";
import { SANS_PRELOAD } from "~/lib/fonts";
import { cacheHeaders } from "~/lib/cache";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

// A placeholder home page.
export const Route = createFileRoute("/{-$locale}/")({
  head: () => ({ links: [SANS_PRELOAD] }),
  headers: () => cacheHeaders("max-age=600, stale-while-revalidate=86400"),
  component: Home,
});

function Home() {
  const { t } = useTranslation();

  return (
    <main className="relative grow flex justify-center px-4 py-8 md:px-8">
      <Background background="general" priority className="h-full" mask="linear-gradient(rgb(255 255 255) 20%, rgb(0 0 0 / 0) 95%)" />
      <div className="w-container">
        <Box className="max-w-160">
          <h1 className="text-mc-2 md:text-mc-3 font-bold">{t("home.title")}</h1>
          <p className="text-20 font-medium text-mc-gray pt-2">{t("home.description")}</p>
        </Box>
      </div>
    </main>
  );
}
