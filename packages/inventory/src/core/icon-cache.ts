/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { decodePng } from "./canvas.js";

const STORE = "icons";

// Bump whenever icons draw differently, so browsers drop the ones older code drew
const VERSION = 1;

const settled = <T>(request: IDBRequest<T>) =>
  new Promise<T>((resolve, reject) => {
    request.addEventListener("success", () => resolve(request.result));
    request.addEventListener("error", () => reject(request.error));
  });

async function open(name: string) {
  const opening = indexedDB.open(name, VERSION);

  opening.addEventListener("upgradeneeded", () => {
    const db = opening.result;
    if (db.objectStoreNames.contains(STORE)) db.deleteObjectStore(STORE);
    db.createObjectStore(STORE);
  });

  const db = await settled(opening);

  // A tab with newer code can't upgrade the database until every other tab lets go of it
  db.addEventListener("versionchange", () => db.close());

  return db;
}

/** Rendered icons as PNGs in IndexedDB, so the next page load skips drawing them */
export class IconCache {
  private db = open("statsify-inventory");

  public async get(key: string) {
    const store = (await this.db).transaction(STORE).objectStore(STORE);
    const png = await settled<Blob | undefined>(store.get(key));
    return png && decodePng(new Uint8Array(await png.arrayBuffer()));
  }

  public async set(key: string, icon: OffscreenCanvas) {
    const png = await icon.convertToBlob();
    const store = (await this.db).transaction(STORE, "readwrite").objectStore(STORE);
    await settled(store.put(png, key));
  }
}
