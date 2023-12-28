/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

/* eslint-disable @typescript-eslint/no-unused-vars */

import i18next, { StringMap, TFunction, TFunctionKeys, TFunctionResult, TOptions } from "i18next";

interface ILocalizeFunction {
	<TKeys extends TFunctionKeys = string>(key: TKeys | TKeys[]): string;
	<TKeys extends TFunctionKeys = string, TInterpolationMap extends object = StringMap>(
		key: TKeys | TKeys[],
		options?: TOptions<TInterpolationMap> & { returnDetails: true; returnObjects: true }
	): string;
	<TKeys extends TFunctionKeys = string, TInterpolationMap extends object = StringMap>(
		key: TKeys | TKeys[],
		options?: TOptions<TInterpolationMap> & { returnDetails: true }
	): string;
	<TKeys extends TFunctionKeys = string, TInterpolationMap extends object = StringMap>(
		key: TKeys | TKeys[],
		options?: TOptions<TInterpolationMap> & { returnObjects: true }
	): string;
	<TKeys extends TFunctionKeys = string, TInterpolationMap extends object = StringMap>(
		key: TKeys | TKeys[],
		options?: TOptions<TInterpolationMap> | string
	): string;
	<TKeys extends TFunctionKeys = string, TInterpolationMap extends object = StringMap>(
		key: TKeys | TKeys[],
		defaultValue?: string,
		options?: TOptions<TInterpolationMap> | string
	): string;
	(key: number): string;
}

export type LocalizeFunction = ILocalizeFunction & { locale: string };

export const getLocalizeFunction = (locale: string): LocalizeFunction => {
	const fixedT = i18next.getFixedT(locale);

	const t = (...args: Parameters<LocalizeFunction>) => {
		if (typeof args[0] === "number") return fixedT("number", { value: args[0] });
		return fixedT(...(args as unknown as Parameters<TFunction>));
	};

	Object.defineProperty(t, "locale", { value: locale });

	return t as LocalizeFunction;
};

export type LocalizationString = string | number | ((t: LocalizeFunction) => TFunctionResult);

const shouldTranslate = (str: LocalizationString): boolean => {
	const type = typeof str;
	return type === "function" || type === "number";
};

export const translateField = <T extends string>(locale: LocalizeFunction, str?: LocalizationString): T => {
	if (str === undefined) return str as unknown as T;
	if (typeof str === "string") return str as T;
	if (typeof str === "number") return locale("number", { value: str }) as T;

	return str(locale) as T;
};

export const translateObject = <T extends Record<string, LocalizationString | any>>(
	locale: LocalizeFunction,
	obj?: T
): { [key in keyof T]: T[key] extends LocalizationString ? string : T[key] } => {
	if (obj === undefined) return obj as unknown as { [key in keyof T]: T[key] };

	for (const key in obj) {
		obj[key] = shouldTranslate(obj[key]) ? translateField(locale, obj[key]) : obj[key];
	}

	return obj;
};

export const translateToAllLanguages = (key: LocalizationString): Record<string, string> => {
	const { options } = i18next as unknown as i18next.i18n;

	if (!Array.isArray(options.preload)) return {};

	return Object.fromEntries(options.preload.map((lang) => [lang, translateField(getLocalizeFunction(lang), key)]));
};
