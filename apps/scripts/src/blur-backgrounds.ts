/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import cluster from "node:cluster";
import os from "node:os";
import { Canvas, loadImage } from "skia-canvas";
import { mkdir, readdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { getAssetPath, HAS_PRIVATE_ASSETS } from "@statsify/assets";

const assetsSource = HAS_PRIVATE_ASSETS ? "private" : "public";
const BACKGROUNDS_PATH = getAssetPath("backgrounds", assetsSource);
const BACKGROUNDS_OUTPUT_PATH = getAssetPath("out/backgrounds", assetsSource);

const backgroundPaths = await readdir(BACKGROUNDS_PATH);

const NUM_CLUSTERS = Math.floor(os.cpus().length / 2);
const backgroundsPerCluster = Math.ceil(backgroundPaths.length / NUM_CLUSTERS);

if (cluster.isPrimary) {
  await rm(BACKGROUNDS_OUTPUT_PATH, { force: true, recursive: true });
  await mkdir(BACKGROUNDS_OUTPUT_PATH, { recursive: true });

  console.log("Generating backgrounds...");

  for (let i = 0; i < NUM_CLUSTERS; i++) cluster.fork();
} else if (cluster.isWorker) {
  const worker = cluster.worker!;
  const clusterId = worker.id - 1;

  const start = clusterId * backgroundsPerCluster;
  const end = (clusterId + 1) * backgroundsPerCluster;

  console.log(`Cluster ${clusterId} started for backgrounds ${start}-${end}`);

  for (let i = start; i < end; i++) {
    const path = backgroundPaths[i];
    if (!path) break;

    const background = await loadImage(join(BACKGROUNDS_PATH, path));

    const canvas = new Canvas(background.width, background.height);
    const ctx = canvas.getContext("2d");

    ctx.filter = "blur(13px)";
    ctx.drawImage(background, 0, 0);
    ctx.filter = "none";

    ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    await writeFile(join(BACKGROUNDS_OUTPUT_PATH, path), await canvas.toBuffer("png"));
  }

  console.log(`Cluster ${clusterId} finished`);
  worker.kill();
}
