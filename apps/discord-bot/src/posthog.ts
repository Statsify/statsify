/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { PostHog } from "posthog-node";
import { Service } from "typedi";
import { config, isSampled } from "@statsify/util";

const apiKey = await config("posthog.apiKey", { required: false });
const enabled = await config("posthog.enabled", { required: false });
const sampleRate = await config("posthog.sampleRate", { default: 0.25 });
const host = await config("posthog.host", { default: "https://us.i.posthog.com" });

interface CaptureOptions {
  distinctId: string;
  event: string;
  properties?: Record<string, unknown>;
}

interface IdentifyOptions {
  distinctId: string;
  properties?: Record<string, unknown>;
}

@Service()
export class PosthogService {
  private readonly client?: PostHog;

  public constructor() {
    if (apiKey && enabled) {
      this.client = new PostHog(apiKey, {
        host,
        enableExceptionAutocapture: false,
      });
    }
  }

  /**
   * Captures an event at 100%, with person processing enabled. Use for
   * conversion/churn events.
   */
  public capture(options: CaptureOptions) {
    this.client?.capture(options);
  }

  public identify(options: IdentifyOptions) {
    this.client?.identify(options);
  }

  /**
   * Captures a high-volume event, deterministically sampled at
   * `posthog.sampleRate` and captured without person processing to keep
   * cost down.
   */
  public captureSampled({ distinctId, event, properties }: CaptureOptions) {
    if (!this.client) return;
    if (!isSampled(distinctId, sampleRate)) return;

    this.client.capture({
      distinctId,
      event,
      properties: { ...properties, $process_person_profile: false },
    });
  }

  public shutdown() {
    return this.client?.shutdown();
  }
}
