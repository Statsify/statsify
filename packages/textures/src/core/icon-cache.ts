/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type DBSchema, type IDBPDatabase, openDB } from "idb";
import { decodePng } from "./canvas.js";

const STORE = "icons";

// Bump this when icons draw differently, so browsers drop old icons
const VERSION = 2;

interface Icons extends DBSchema {
  [STORE]: { key: string; value: Blob };
}

function open(onClose: () => void) {
  const db = openDB<Icons>("statsify-textures", VERSION, {
    upgrade(database) {
      if (database.objectStoreNames.contains(STORE))
        database.deleteObjectStore(STORE);
      database.createObjectStore(STORE);
    },
    // Newer code can't upgrade the database until every other tab closes it
    blocking() {
      void db.then((database) => database.close());
      onClose();
    },
    terminated: onClose,
  });

  return db;
}

async function keepStack(db: IDBPDatabase<Icons>, stack: string) {
  const store = db.transaction(STORE, "readwrite").store;
  const keys = await store.getAllKeys();
  await Promise.all(
    keys
      .filter((key) => !key.startsWith(`${stack}/`))
      .map((key) => store.delete(key)),
  );
}

// The first pack stack to open the cache after a page load drops the rest
export class IconCache {
  private db?: Promise<IDBPDatabase<Icons>>;

  private async database(stack: string) {
    this.db ??= open(() => (this.db = undefined)).then(async (db) => {
      await keepStack(db, stack);
      return db;
    });

    return this.db;
  }

  public async get(stack: string, key: string) {
    const png = await this.database(stack)
      .then((db) => db.get(STORE, key))
      .catch(() => undefined);
    return png && decodePng(new Uint8Array(await png.arrayBuffer()));
  }

  public async set(stack: string, key: string, icon: OffscreenCanvas) {
    const png = await icon.convertToBlob();
    await (await this.database(stack)).put(STORE, png, key);
  }
}
