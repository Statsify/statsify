/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Field } from "#metadata";

export class Tag {
	@Field({ mongo: { unique: true } })
	public name: string;

	@Field({ mongo: { unique: true } })
	public id: string;

	@Field()
	public content: string;

	@Field({ store: { required: false } })
	public attachment?: string;
}
