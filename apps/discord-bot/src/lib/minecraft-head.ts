import { randomUUID } from "node:crypto";

export function minecraftHeadUrl(uuid: string) {
  const dashlessUuid = uuid.replaceAll("-", "");
  return `https://crafatar.com/avatars/${dashlessUuid}?size=160&default=MHF_Steve&overlay&id=${randomUUID()}`;
}