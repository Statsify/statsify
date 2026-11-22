/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type AnyRoute, createRoute } from "@tanstack/react-router";
import { Gallery } from "./gallery";
import { Route as LocaleRoute } from "~/routes/{-$locale}";

/** Also the string `scripts/check-public-output.ts` looks for: it must never appear in a production build. */
export const GALLERY_PATH = "dev/gallery";

const galleryRoute = createRoute({
  getParentRoute: () => LocaleRoute,
  path: GALLERY_PATH,
  head: () => ({ meta: [{ title: "Component gallery | Statsify" }, { name: "robots", content: "noindex" }] }),
  component: Gallery,
});

/**
 * Adds the gallery under the locale layout, with the real header, footer and translations. A code route, not a file in
 * `routes/`, so the generated route tree, the sitemap and production builds never see it.
 */
export function addGalleryRoute(): void {
  const children = (LocaleRoute.children ?? []) as AnyRoute[];
  if (!children.includes(galleryRoute)) LocaleRoute.addChildren([...children, galleryRoute]);
}
