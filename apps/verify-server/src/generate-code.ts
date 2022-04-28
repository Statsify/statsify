import type { VerifyCode } from '@statsify/schemas';
import type { ReturnModelType } from '@typegoose/typegoose';

const createCode = () => Math.floor(Math.random() * (9999 - 1000 + 1) + 1000).toString();

export const generateCode = async (verifyCodesModel: ReturnModelType<typeof VerifyCode>) => {
  let code = createCode();

  //Make sure the code is unique
  while (await verifyCodesModel.exists({ code }).lean().exec()) {
    code = createCode();
  }

  return code;
};
