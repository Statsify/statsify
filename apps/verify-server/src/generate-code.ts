/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import type { ReturnModelType } from "@typegoose/typegoose";
import type { VerifyCode } from "@statsify/schemas";

const createCode = () => Math.floor(Math.random() * (9999 - 1000 + 1) + 1000).toString();

export const generateCode = async (
  verifyCodesModel: ReturnModelType<typeof VerifyCode>
) => {
  let code = createCode();

  // Make sure the code is unique
  while (await verifyCodesModel.exists({ code }).lean().exec()) {
    code = createCode();
  }

  return code;
};
