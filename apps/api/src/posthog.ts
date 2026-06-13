/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { PostHog } from "posthog-node";
import { config, isSampled } from "@statsify/util";

const apiKey = await config("posthog.apiKey", { required: false });
const enabled = await config("posthog.enabled", { required: false });
const sampleRate = await config("posthog.sampleRate", { default: 0.25 });

let posthog: PostHog | undefined;

if (apiKey && enabled) {
  posthog = new PostHog(apiKey, {
    host: await config("posthog.host", { default: "https://us.i.posthog.com" }),
    enableExceptionAutocapture: false,
  });
}

interface SampledCaptureOptions {
  distinctId: string;
  event: string;
  properties?: Record<string, unknown>;
}

/**
 * Captures a high-volume event, deterministically sampled at `posthog.sampleRate`
 * and captured without person processing to keep cost down.
 */
export function captureSampled({ distinctId, event, properties }: SampledCaptureOptions) {
  if (!posthog) return;
  if (!isSampled(distinctId, sampleRate)) return;

  posthog.capture({
    distinctId,
    event,
    properties: { ...properties, $process_person_profile: false },
  });
}

export { posthog };
