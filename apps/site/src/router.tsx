/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ErrorPage } from "~/components/error-page";
import { NotFound } from "~/components/not-found";
import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { reportRouteError } from "~/lib/sentry";
import { routeTree } from "./routeTree.gen";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";

export interface RouterContext {
  queryClient: QueryClient;
}

// The component gallery (`src/gallery`) exists on the dev server only: a production build drops this branch and the
// gallery's code with it, and `scripts/check-public-output.ts` fails the build if any of it ships.
if (import.meta.env.DEV) await import("./gallery/route").then((gallery) => gallery.addGalleryRoute());

export function getRouter() {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    defaultPreload: "intent",
    defaultNotFoundComponent: () => <NotFound />,
    defaultErrorComponent: ErrorPage,
    // The browser's caught errors; on the server the error page reports a failed loader itself.
    defaultOnCatch: reportRouteError,
    scrollRestoration: true,
  });

  setupRouterSsrQueryIntegration({ router, queryClient });

  return router;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }

  interface StaticDataRouteOption {
    /** The URL of the route's tab icon (a player's head, a game's icon) from its loader's data; nothing for the logo. */
    tabIcon?: (loaderData: unknown) => string | undefined;
  }

  interface HistoryState {
    /** When the site's search opened the page (`Date.now()`), so its player updates as a bot command would. */
    searchedAt?: number;
  }
}
