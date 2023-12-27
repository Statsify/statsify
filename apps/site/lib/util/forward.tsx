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
		| (new (props: any) => Component<any>)
		| ((props: any, context?: any) => ReactNode)
		| keyof JSX.IntrinsicElements,
	P = {},
>(render: ForwardRefRenderFunction<ElementRef<T>, ComponentProps<T> & P>) {
  return forwardRef(render);
}

export function withDefault<
	T extends
		| ForwardRefExoticComponent<any>
		| (new (props: any) => Component<any>)
		| ((props: any, context?: any) => ReactNode)
		| keyof JSX.IntrinsicElements,
>(displayName: string, Component: T, defaultProps: Partial<ComponentProps<T>>) {
  const forwardedComponent = forward((props, ref) => (
    <Component {...props} {...defaultProps} className={twMerge(defaultProps.className, props.className)} ref={ref} />
  ));

  forwardedComponent.displayName = displayName;

  return forwardedComponent;
}
