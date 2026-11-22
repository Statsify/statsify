/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type APIInteraction, InteractionResponseType, InteractionType } from "discord-api-types/v10";
import { type IncomingMessage, type ServerResponse, createServer } from "node:http";
import { type KeyObject, createPublicKey, verify } from "node:crypto";
import { Logger } from "@statsify/logger";
import { finished } from "node:stream/promises";
import type { InteractionReply, InteractionResponder } from "./interaction.js";
import type { RawFile } from "@discordjs/rest";

export type InteractionRequestHandler = (
  interaction: APIInteraction,
  respond: InteractionResponder
) => Promise<void>;

export class InteractionServer {
  private readonly key: KeyObject;
  private readonly server = createServer((req, res) => this.onRequest(req, res));
  private handler?: InteractionRequestHandler;
  private readonly logger = new Logger("InteractionServer");

  public constructor(publicKey: string) {
    this.key = createPublicKey({
      key: { kty: "OKP", crv: "Ed25519", x: Buffer.from(publicKey, "hex").toString("base64url") },
      format: "jwk",
    });

    this.server.on("error", (error) => this.logger.error(error));
  }

  public onInteraction(handler: InteractionRequestHandler) {
    this.handler = handler;
  }

  public listen(port: number) {
    return new Promise<void>((resolve, reject) => {
      this.server.once("error", reject);
      this.server.listen(port, resolve);
    });
  }

  private async onRequest(req: IncomingMessage, res: ServerResponse) {
    const signature = req.headers["x-signature-ed25519"];
    const timestamp = req.headers["x-signature-timestamp"];

    const chunks: Buffer[] = [];
    for await (const chunk of req) chunks.push(chunk);
    const body = Buffer.concat(chunks);

    if (
      typeof signature !== "string" ||
      typeof timestamp !== "string" ||
      !verify(null, Buffer.concat([Buffer.from(timestamp), body]), this.key, Buffer.from(signature, "hex"))
    ) {
      res.writeHead(401).end();
      return;
    }

    const interaction = JSON.parse(body.toString()) as APIInteraction;

    if (interaction.type === InteractionType.Ping) {
      await respond(res, { type: InteractionResponseType.Pong });
      return;
    }

    try {
      await this.handler?.(interaction, (response) => respond(res, response));
    } finally {
      if (!res.writableEnded) res.writeHead(500).end();
    }
  }
}

async function respond(res: ServerResponse, { files, ...response }: InteractionReply) {
  const json = JSON.stringify(response);

  const [contentType, payload] = files?.length ?
    await toMultipart(json, files) :
    ["application/json", json];

  res.writeHead(200, { "Content-Type": contentType });

  res.end(payload);
  // end's callback never runs when Discord already closed the request; finished() settles either way
  await finished(res);
}

async function toMultipart(json: string, files: RawFile[]): Promise<[contentType: string, payload: Buffer]> {
  const form = new FormData();
  form.append("payload_json", json);

  for (const [index, file] of files.entries()) {
    const data = typeof file.data === "object" ? new Uint8Array(file.data) : `${file.data}`;
    form.append(`files[${index}]`, new Blob([data], { type: file.contentType }), file.name);
  }

  const multipart = new Response(form);
  return [multipart.headers.get("content-type")!, Buffer.from(await multipart.arrayBuffer())];
}
