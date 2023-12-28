/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
	type Component,
	type ComponentProps,
	type ElementRef,
	type ForwardRefExoticComponent,
	type ForwardRefRenderFunction,
	type ReactNode,
	forwardRef,
} from "react";
import { twMerge } from "tailwind-merge";

export function forward<
	T extends
		| ForwardRefExoticComponent<any>
		| (new (properties: any) => Component<any>)
		| ((properties: any, context?: any) => ReactNode)
		| keyof JSX.IntrinsicElements,
	P = {},
>(render: ForwardRefRenderFunction<ElementRef<T>, ComponentProps<T> & P>) {
	return forwardRef(render);
}

export function withDefault<
	T extends
		| ForwardRefExoticComponent<any>
		| (new (properties: any) => Component<any>)
		| ((properties: any, context?: any) => ReactNode)
		| keyof JSX.IntrinsicElements,
>(displayName: string, Component: T, defaultProps: Partial<ComponentProps<T>>) {
	const forwardedComponent = forward((properties, reference) => (
		<Component {...properties} {...defaultProps} className={twMerge(defaultProps.className, properties.className)} ref={reference} />
	));

	forwardedComponent.displayName = displayName;

	return forwardedComponent;
}
