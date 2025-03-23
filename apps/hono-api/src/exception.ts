/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { HTTPException } from "hono/http-exception";
import type { ContentfulStatusCode } from "hono/utils/http-status";

export class ApiException extends HTTPException {
  public constructor(status: ContentfulStatusCode, issues: string[]) {
    const response = new Response(JSON.stringify({
      success: false,
      issues,
    }), { status });

    super(status, { res: response });
  }
}
