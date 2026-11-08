/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import * as Sentry from "@sentry/node";
import { Logger, captureError, isProduction } from "./logger.js";

export type RequestOutcome = "success" | "message" | "error";
export type SampleReason = "error" | "slow" | "user" | "sampled";

// Sentry doesn't scrub these, so no Discord usernames, API keys or message content
export type RequestAttributes = {
  "discord.interaction.type"?: string;
  "discord.interaction.ack_ms"?: number;
  "discord.gateway.event"?: string;
  "discord.command"?: string;
  "discord.guild.id"?: string;
  "discord.locale"?: string;
  "http.request.method"?: string;
  "http.route"?: string;
  "http.response.status_code"?: number;
  "hypixel.request.count"?: number;
  "hypixel.request.duration_ms"?: number;
  "hypixel.response.status_codes"?: string;
  "hypixel.ratelimit.remaining"?: number;
  "error.type"?: string;
  "error.message"?: string;
  "statsify.error.code"?: string | number;
  "statsify.error.retryable"?: boolean;
  "statsify.outcome"?: RequestOutcome;
  "statsify.duration_ms"?: number;
  "statsify.sample.reason"?: SampleReason;
  "statsify.user.tier"?: string;
  "statsify.user.uuid"?: string;
  "statsify.mode"?: string;
  "statsify.submode"?: string;
  "statsify.api.client"?: string;
  "statsify.api.role"?: string;
  "statsify.player"?: string;
  "statsify.player.tag"?: string;
  "statsify.guild.tag"?: string;
  "statsify.guild.members.unresolved"?: number;
  "statsify.cache.level"?: string;
  "statsify.cache.hit"?: boolean;
  "statsify.verify.code"?: "existing" | "created";
  "statsify.premium.change"?: string;
  "statsify.leaderboard.count"?: number;
  "statsify.leaderboard.member_limit"?: number;
};

export interface RequestEvent {
  message: string;
  durationMs: number;
  slowMs?: number;
  alwaysKeep?: boolean;
  sampleRate?: number;
}

const SAMPLE_RATE = isProduction ? 0.05 : 1;

// Discord fails the interaction when the acknowledgement takes over 3 seconds
const SLOW_ACK_MS = 1500;

// Error events only get tags, and Sentry drops tag keys over 32 characters
const TAGGED_ATTRIBUTES = new Set<string>([
  "discord.command",
  "discord.guild.id",
  "discord.locale",
  "http.route",
  "statsify.user.tier",
  "statsify.user.uuid",
  "statsify.mode",
  "statsify.submode",
  "statsify.outcome",
  "statsify.api.role",
  "statsify.player",
  "statsify.player.tag",
  "statsify.guild.tag",
  "statsify.cache.hit",
] satisfies (keyof RequestAttributes)[]);

type CountAttribute = {
  [K in keyof RequestAttributes]-?: NonNullable<RequestAttributes[K]> extends number ? K : never;
}[keyof RequestAttributes];

const logger = new Logger("Event");

export const setRequestAttributes = (attributes: RequestAttributes) => {
  Sentry.setAttributes(attributes);
  Sentry.setTags(Object.fromEntries(Object.entries(attributes).filter(([key]) => TAGGED_ATTRIBUTES.has(key))));
};

export const getRequestAttributes = () =>
  Sentry.getIsolationScope().getScopeData().attributes as RequestAttributes;

export const addRequestAttributes = (counts: Partial<Record<CountAttribute, number>>) => {
  const attributes = getRequestAttributes();

  setRequestAttributes(
    Object.fromEntries(
      Object.entries(counts).map(([key, count]) => [key, (attributes[key as CountAttribute] ?? 0) + count])
    )
  );
};

export const setRequestError = (
  error: unknown,
  details: { code?: string | number; retryable?: boolean } = {}
) => {
  captureError(error);

  setRequestAttributes({
    "statsify.outcome": "error",
    "error.type": error instanceof Error ? error.name : typeof error,
    "error.message": error instanceof Error ? error.message : String(error),
    "statsify.error.code": details.code,
    "statsify.error.retryable": details.retryable,
  });
};

const getSampleReason = (
  attributes: RequestAttributes,
  { durationMs, slowMs = Number.POSITIVE_INFINITY, alwaysKeep = false, sampleRate = SAMPLE_RATE }: RequestEvent
): SampleReason | undefined => {
  if (attributes["statsify.outcome"] === "error") return "error";
  if (durationMs >= slowMs || (attributes["discord.interaction.ack_ms"] ?? 0) >= SLOW_ACK_MS) return "slow";
  if (alwaysKeep) return "user";
  if (Math.random() < sampleRate) return "sampled";
  return undefined;
};

export const emitRequestEvent = (event: RequestEvent) => {
  const attributes = getRequestAttributes();
  const reason = getSampleReason(attributes, event);

  if (!reason) return;

  const outcome = attributes["statsify.outcome"] ?? "success";

  logger[outcome === "error" ? "error" : "log"](event.message, {
    ...attributes,
    "statsify.outcome": outcome,
    "statsify.duration_ms": Math.round(event.durationMs),
    "statsify.sample.reason": reason,
  });
};

export const withRequestEvent = (
  request: () => unknown,
  getEvent: (attributes: RequestAttributes) => Omit<RequestEvent, "durationMs">
) =>
  Sentry.withIsolationScope(async () => {
    const start = performance.now();

    try {
      await request();
    } catch (error) {
      logger.print("error", error);
      setRequestError(error);
    } finally {
      emitRequestEvent({ ...getEvent(getRequestAttributes()), durationMs: performance.now() - start });
    }
  });
