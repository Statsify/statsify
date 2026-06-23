/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { PostHog } from "posthog-node";
import { config } from "@statsify/util";

const apiKey = await config("posthog.apiKey", { required: false });
const enabled = await config("posthog.enabled", { required: false });

let posthog: PostHog | undefined;

if (apiKey && enabled) {
  posthog = new PostHog(apiKey, {
    host: await config("posthog.host", { default: "https://us.i.posthog.com" }),
    enableExceptionAutocapture: false,
  });
}

export { posthog };
