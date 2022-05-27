import { getAssetPath } from '@statsify/assets';
import { Logger } from '@statsify/logger';
import { VerifyCode } from '@statsify/schemas';
import { formatTime } from '@statsify/util';
import { getModelForClass } from '@typegoose/typegoose';
import { readFileSync } from 'fs';
import { createServer } from 'minecraft-protocol';
import { connect } from 'mongoose';
import { generateCode } from './generate-code';

const logger = new Logger('Verify Server');

const codeCreatedMessage = (code: string, time: Date) => {
  //Add on the expirey time to the time provided by mongo
  let expireTime = time.getTime() + 300 * 1000;
  expireTime -= new Date().getTime();

  return `§9§lStatsify Verification Server\n\n§r§7Your verification code is §c§l${code}§r§7\n\nHead back over to §5Discord §r§7and run §f§l/verify code:${code}§r§7\nYour code will expire in §8${formatTime(
    expireTime,
    { short: false, entries: 4 }
  )}§r§7.`;
};

async function bootstrap() {
  await connect(process.env.MONGODB_URI);

  const verifyCodesModel = getModelForClass(VerifyCode);

  const serverLogo = readFileSync(getAssetPath('logos/logo_64.png'), { encoding: 'base64' });

  const server = createServer({
    host: process.env.VERIFY_SERVER_IP,
    maxPlayers: 2,
    motd: '§9§lStatsify Verification',
    beforePing: (response) => {
      //Remove the version from the response
      response.version.name = '';

      //Set the server icon
      response.favicon = `data:image/png;base64,${serverLogo}`;
    },
  });

  logger.log('Server Started');

  server.on('login', async (client) => {
    logger.verbose(`${client.username} has joined`);

    const uuid = client.uuid.replace(/-/g, '');

    const previousVerifyCode = await verifyCodesModel.findOne({ uuid }).lean().exec();

    if (previousVerifyCode)
      return client.end(codeCreatedMessage(previousVerifyCode.code, previousVerifyCode.expireAt));

    const code = await generateCode(verifyCodesModel);
    const verifyCode = await verifyCodesModel.create(new VerifyCode(uuid, code));

    client.end(codeCreatedMessage(verifyCode.code, verifyCode.expireAt));
    logger.verbose(`${client.username} has been assigned to the code ${verifyCode.code}`);
  });
}

bootstrap();
