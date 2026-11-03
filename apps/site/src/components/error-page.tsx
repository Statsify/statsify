/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Button } from "~/components/ui/button";
import { Error } from "~/components/ui/error";
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
      <LogoError className="size-64 lg:size-80" />
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-mc-3 lg:text-mc-4 font-bold text-redify-200">
          {t("error.title", "Something went wrong")}
        </h1>
        <p className="text-20 font-medium text-mc-gray text-center">
          {t("error.description", "Try again in a moment.")}
        </p>
        <div className="flex flex-wrap justify-center gap-4 pt-2">
          <Button asChild className="w-48">
            <button type="button" onClick={retry}>
              {t("error.tryAgain", "Try Again")}
            </button>
          </Button>
          <Button asChild className="w-48">
            <a href="/">{t("error.home", "Home")}</a>
          </Button>
        </div>
      </div>
    </Error>
  );
}
