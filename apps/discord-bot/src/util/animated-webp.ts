/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import sharp from "sharp";
import type { Canvas } from "skia-canvas";

function writeUint24LE(buf: Buffer, offset: number, value: number): void {
  buf[offset] = value & 0xff;
  buf[offset + 1] = (value >> 8) & 0xff;
  buf[offset + 2] = (value >> 16) & 0xff;
}

function buildChunk(tag: string, payload: Buffer): Buffer {
  const header = Buffer.allocUnsafe(8);
  header.write(tag.padEnd(4, " "), 0, "ascii");
  header.writeUInt32LE(payload.length, 4);
  const pad = payload.length % 2 === 1 ? Buffer.alloc(1) : Buffer.alloc(0);
  return Buffer.concat([header, payload, pad]);
}

/**
 * Encodes an array of canvas frames as a single looping animated WebP using
 * manual RIFF assembly. Each frame is lossless-encoded via sharp; falls back
 * to quality-85 lossy if the combined lossless size exceeds 6 MB.
 *
 * Used by both the BedWars spinning-skin path and the /text obfuscated path.
 */
export async function encodeAnimatedWebP(
  frameCanvases: Canvas[],
  delayMs: number,
  /** 0 = loop forever (default), 1 = play once, N = play N times. */
  loop = 0
): Promise<Buffer> {
  const frameWidth = frameCanvases[0].width;
  const frameHeight = frameCanvases[0].height;

  const frameWebPs: Buffer[] = [];
  for (const canvas of frameCanvases) {
    const ctx = canvas.getContext("2d");
    const { data } = ctx.getImageData(0, 0, frameWidth, frameHeight);
    const webp = await sharp(Buffer.from(data.buffer), {
      raw: { width: frameWidth, height: frameHeight, channels: 4 },
    })
      .webp({ lossless: true })
      .toBuffer();
    frameWebPs.push(webp);
  }

  const estimatedSize = frameWebPs.reduce((sum, b) => sum + b.length, 0);
  if (estimatedSize > 6 * 1024 * 1024) {
    frameWebPs.length = 0;
    for (const canvas of frameCanvases) {
      const ctx = canvas.getContext("2d");
      const { data } = ctx.getImageData(0, 0, frameWidth, frameHeight);
      const webp = await sharp(Buffer.from(data.buffer), {
        raw: { width: frameWidth, height: frameHeight, channels: 4 },
      })
        .webp({ quality: 85 })
        .toBuffer();
      frameWebPs.push(webp);
    }
  }

  // Strip the 12-byte RIFF/WEBP header; what remains is the VP8L/VP8 chunk.
  const frameStreams = frameWebPs.map((webp) => webp.subarray(12));

  const vp8xPayload = Buffer.alloc(10);
  vp8xPayload[0] = 0x12; // Animation (bit 1) | Alpha (bit 4)
  writeUint24LE(vp8xPayload, 4, frameWidth - 1);
  writeUint24LE(vp8xPayload, 7, frameHeight - 1);

  const animPayload = Buffer.alloc(6);
  animPayload.writeUInt16LE(loop, 4);

  const anmfChunks = frameStreams.map((stream) => {
    const payload = Buffer.allocUnsafe(16 + stream.length);
    writeUint24LE(payload, 0, 0);
    writeUint24LE(payload, 3, 0);
    writeUint24LE(payload, 6, frameWidth - 1);
    writeUint24LE(payload, 9, frameHeight - 1);
    writeUint24LE(payload, 12, delayMs);
    payload[15] = 0x02; // no-blend flag
    stream.copy(payload, 16);
    return buildChunk("ANMF", payload);
  });

  const chunks = Buffer.concat([
    buildChunk("VP8X", vp8xPayload),
    buildChunk("ANIM", animPayload),
    ...anmfChunks,
  ]);

  const riff = Buffer.allocUnsafe(12);
  riff.write("RIFF", 0, "ascii");
  riff.writeUInt32LE(chunks.length + 4, 4);
  riff.write("WEBP", 8, "ascii");

  const result = Buffer.concat([riff, chunks]);

  if (result.byteLength > 7 * 1024 * 1024) {
    console.warn(
      `[animated-webp] output is ${(result.byteLength / 1024 / 1024).toFixed(1)} MB — exceeds 7 MB soft cap`
    );
  }

  return result;
}
