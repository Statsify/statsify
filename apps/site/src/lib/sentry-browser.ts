/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

// A dynamic import of the package itself keeps all of it, Replay and Feedback included; this module's names don't.
export { captureException, init, tanstackRouterBrowserTracingIntegration } from "@sentry/tanstackstart-react";
