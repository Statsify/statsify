/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Button } from "~/components/ui/button";
import { Error, ErrorText } from "~/components/ui/error";
import { LogoError } from "~/components/icons/logo-error";
import { reportRouteError } from "~/lib/sentry";
import { useRouter } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import type { ErrorComponentProps } from "@tanstack/react-router";

// Default values keep the page readable when it renders above the locale layout (no translations yet).
export function ErrorPage({ error, reset }: ErrorComponentProps) {
  const { t } = useTranslation();
  const router = useRouter();

  // On the server the router renders this page for a loader that failed, and nothing is thrown that Sentry would see.
  if (router.isServer) reportRouteError(error);

  // Reloads the failed loaders, then clears the boundary so the route renders again.
  const retry = () => {
    void router.invalidate();
    reset();
  };

  return (
    <Error>
      <LogoError className="size-40 sm:size-64" />
      <div className="flex w-full flex-col items-center gap-4">
        <ErrorText heading={<h1 className="text-mc-2 sm:text-mc-3 font-bold text-mc-red">{t("error.title", "Something Went Wrong")}</h1>}>
          <p className="text-mc-1.5 sm:text-mc-2 text-mc-gray text-center">{t("error.description", "Statsify couldn't load this page. Try again in a moment.")}</p>
        </ErrorText>
        {/* One primary action; home is a plain link. */}
        <div className="flex flex-col items-center gap-2 pt-2">
          <Button asChild variant="primary" className="min-w-48">
            <button type="button" onClick={retry}>
              {t("error.tryAgain", "Try Again")}
            </button>
          </Button>
          <a href="/" className="flex min-h-11 items-center text-mc-1 text-mc-white underline">
            {t("error.home", "Home")}
          </a>
        </div>
      </div>
    </Error>
  );
}
