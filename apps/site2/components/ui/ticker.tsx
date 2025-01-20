/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

"use client";

import * as motion from "motion/react-client";
import { Children, type ReactNode, useEffect, useRef, useState } from "react";
import { useAnimationControls, useInView } from "motion/react";

export function Ticker({ children }: { children: ReactNode }) {
	const [duplicates, setDuplicates] = useState(0);
	const [height, setHeight] = useState<number | undefined>(undefined);
	const items = Children.toArray(children);
	const itemRefs = useRef<HTMLDivElement[]>([]);
	const controls = useAnimationControls();
	const scope = useRef<HTMLDivElement>(null);
	const isInView = useInView(scope);

	useEffect(() => {
		if (scope.current && height) {
			const duplicates = Math.max(Math.ceil((2 * scope.current.clientHeight) / height), 1);
			setDuplicates(duplicates);
		}
	}, [scope.current, height]);

	useEffect(() => {
		const height = itemRefs
			.current
			.map((ref) => ref.clientHeight)
			.reduce((acc, h) => acc + h, 0);

		setHeight(height);
	}, [items]);

	useEffect(() => {
		if (isInView) controls.start({ y: height ?? 0 });
		return () => controls.stop();
	}, [isInView, controls, height]);

	return (
		<div>
			<motion.div ref={scope} animate={controls}>
				{items.map((item, index) => (
					<div
						key={index}
						ref={(ref) => (itemRefs.current[index] = ref)}
					>
						{item}
					</div>
				))}
				{Array.from({ length: duplicates }).map((_, index) => items.map((item, i) => (
					<div key={i + index}>{item}</div>
				)))}
			</motion.div>
		</div>
	);
}
