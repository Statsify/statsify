/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { RestResponse } from "tiny-discord";
import { noop } from "@statsify/util";

export const parseDiscordResponse = <T>(response: RestResponse): T => {
	if (response.headers["content-type"] !== "application/json") return noop();

	//@ts-ignore tiny-discord doesn't have a proper types yet
	if (response.status >= 200 && response.status < 300) return response.body.json as T;

	//@ts-ignore tiny-discord doesn't have a proper types yet
	const body = response.body.json as Record<string, any>;

	let message = body.message;

	if (body.errors) {
		const error = parseDiscordError(body.errors);
		message += ` | ${error}`;
	}

	throw new Error(message);
};

export const parseDiscordError = (error: any = {}, errorKey = ""): string => {
	if (typeof error.message === "string") return `${errorKey.length ? `${errorKey} - ${error.code}` : `${error.code}`}: ${error.message}`.trim();

	const entries = Object.entries(error) as [string, any][];
	let message = "";

	for (const [key, value] of entries) {
		let nextKey = key;

		if (key.startsWith("_")) {
			nextKey = errorKey;
		} else if (errorKey) {
			nextKey = Number.isNaN(+key) ? `${errorKey}.${key}` : `${errorKey}[${key}]`;
		}

		if (typeof value === "string") message += value;
		else if ("_errors" in value) for (const error of value._errors) message += parseDiscordError(error, nextKey);
		else message += parseDiscordError(value, nextKey);
	}

	return message;
};
