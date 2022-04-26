import { Logger } from '@statsify/logger';
import { User, VerifyCode } from '@statsify/schemas';
import { formatTime } from '@statsify/util';
import { getModelForClass } from '@typegoose/typegoose';
import { createServer } from 'minecraft-protocol';
import { connect } from 'mongoose';
import { generateCode } from './generate-code';

const logger = new Logger('Verify Server');

const codeCreatedMessage = (code: string, time: Date) => {
  //Add on the expirey time to the time provided by mongo
  let expireTime = time.getTime() + 300 * 1000;
  expireTime -= new Date().getTime();

  return `Your verification code is §c§l${code}§r.\nHead back over to §9Discord §fand run §7/verify [code]§f.\nYou code will expire in §7${formatTime(
    expireTime
  )}.`;
};

async function bootstrap() {
  await connect(process.env.MONGODB_URI);

  const usersModel = getModelForClass(User);
  const verifyCodesModel = getModelForClass(VerifyCode);

  const server = createServer({
    host: process.env.VERIFY_SERVER_IP,
    maxPlayers: 2,
    motd: 'Hello, Minecraft!',
  });

  logger.log('Server Started');

  server.on('login', async (client) => {
    logger.verbose(`${client.username} has joined the server`);

    const uuid = client.uuid.replace(/-/g, '');

    const isUserVerified = await usersModel.exists({ uuid }).lean().exec();

    if (isUserVerified) return client.end('You are already verified!');

    const previousVerifyCode = await verifyCodesModel.findOne({ uuid }).lean().exec();

    if (previousVerifyCode)
      return client.end(codeCreatedMessage(previousVerifyCode.code, previousVerifyCode.expireAt));

    const code = await generateCode(verifyCodesModel);
    const verifyCode = await verifyCodesModel.create(new VerifyCode(uuid, code));

    client.end(codeCreatedMessage(verifyCode.code, verifyCode.expireAt));
  });
}

bootstrap();
