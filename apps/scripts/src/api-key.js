/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

// ! I (ugcodrr) am not liable for any damages or loss of data caused by this script.

import Redis from "ioredis";
import inquirer from "inquirer";
import { createHash, randomUUID } from "node:crypto";
import { inquirerConfirmation, inquirerLogger } from "./utils.js";
const redis = new Redis(process.env.REDIS_URL);

// TODO unify functions (one createKey)
const createKey = async ({ name, key, role, limit }) => {
  const activeKeys = await getKeyNames();

  if (activeKeys.includes(name)) {
    inquirerLogger("Duplicate Key!", `The key ID of ${name} already exists!`);
    return false;
  } else if (activeKeys.includes(key)) {
    inquirerLogger("Duplicate Key!", `The key value of ${key} already exists!`);
    return false;
  }

  const hash = createHash("sha256").update(key).digest("hex");
  await redis.hmset(
    `key:${hash}`,
    "name",
    name,
    "role",
    roles.indexOf(role),
    "limit",
    limit,
    "requests",
    0,
    "createdAt",
    Date.now()
  );

  return true;
};

const getKeys = async () => {
  const keys = await redis.keys("key:*");

  const pipeline = redis.pipeline();

  keys.forEach((key) => {
    pipeline.hgetall(key);
  });

  const keyValues = await pipeline.exec();

  return Object.assign(
    {},
    ...keyValues.map((key, index) => ({ [keys[index].replace("key:", "")]: key[1] }))
  );
};

const getKeyNames = async () => Object.values(await getKeys()).map((key) => key.name);

const defaultKey = () =>
  (
    process.env.SUDO_USER ||
    process.env.C9_USER ||
    process.env.LOGNAME ||
    process.env.USER ||
    process.env.LNAME ||
    process.env.USERNAME ||
    randomUUID()
  )
    .trim()
    .toLowerCase() + Math.floor(Math.random() * 1000);

const roles = ["user", "admin"];

const keyManager = async () => {
  if (process.argv.includes("--nonInteractiveKeyCreation")) {
    // TODO potentially just take input from .env later lol
    const keyStatus = await createKey({
      name: "testKey",
      key: "testKey",
      role: "admin",
      limit: 999,
    });

    if (!keyStatus) process.exit(0);

    inquirerLogger(
      `New Key!`,
      `testKey with ID of testKey and role of admin with weighted limit of 999 was just created non interactively.`
    );

    process.exit(0);
  }

  const availableMethods = ["create"];

  if ((await getKeyNames()).length) availableMethods.push("delete", "edit", "list");
  const { method } = await inquirer.prompt([
    {
      type: "list",
      name: "method",
      message: "API Key Action?",
      choices: availableMethods,
      default: "create",
    },
  ]);

  switch (method) {
    case "create": {
      await createNewKey();
      break;
    }
    case "delete": {
      await deleteKey();
      break;
    }
    case "list": {
      await listKeys();
      break;
    }
    case "edit":
      {
        await editKey();
        // No default
      }
      break;
  }

  process.exit(0);
};

const createNewKey = async () => {
  const defaultKeyValue = defaultKey();
  const { key, name, role, limit } = await inquirer.prompt([
    {
      type: "input",
      name: "key",
      message: "API Key Value?",
      default: defaultKeyValue,
    },
    {
      type: "input",
      name: "name",
      message: "API Key Identifier (internal purposes)?",
      default: defaultKeyValue,
    },
    {
      type: "list",
      name: "role",
      message: "API Key Role?",
      choices: roles,
      default: "admin",
    },
    {
      type: "number",
      name: "limit",
      message: "Weighted request limit per minute?",
      default: 999,
    },
  ]);

  let keyCreated = await createKey({ key, name, role, limit });

  if (keyCreated)
    inquirerLogger(
      `New Key!`,
      `${key} with ID of ${name} and role of ${role} with weighted limit of ${limit}.`
    );
};

const deleteKey = async () => {
  const { deletedKey } = await inquirer.prompt([
    {
      type: "list",
      name: "deletedKey",
      message: "Which API Key?",
      choices: await getKeyNames(),
    },
  ]);

  if (!(await inquirerConfirmation(false))) return;

  const activeKeys = await getKeys();

  for (const key in activeKeys) {
    let currentKey = activeKeys[key];

    if (currentKey.name === deletedKey) {
      await redis.del(`key:${key}`);
      inquirerLogger(
        "Deleted Key!",
        `Key with ID of ${deletedKey} has been deleted (${key})`
      );
      return;
    }
  }
};

const listKeys = async () => {
  const activeKeys = await getKeys();

  for (const key in activeKeys) {
    let currentKey = activeKeys[key];
    inquirerLogger(
      `${currentKey.name}`,
      `with ${roles[currentKey.role]} role and weighted limit of ${
        currentKey.limit
      } and ${currentKey.requests} lifetime requests.`
    );
  }
};

const editKey = async () => {
  const { editedKey, field } = await inquirer.prompt([
    {
      type: "list",
      name: "editedKey",
      message: "Which API Key?",
      choices: await getKeyNames(),
    },
    {
      type: "list",
      name: "field",
      message: "Which Field?",
      choices: ["name", "role", "limit"],
    },
  ]);

  if (!(await inquirerConfirmation(true))) return;

  const activeKeys = await getKeys();

  let currentValue = "";
  let currentHash = "";
  for (const key in activeKeys) {
    if (activeKeys[key].name === editedKey) {
      currentValue = activeKeys[key][`${field}`];
      currentHash = key;
    }
  }

  const newValue = await inquirer.prompt([
    {
      type: "number",
      name: "newValue",
      message: `New ${field} value?`,
      default: currentValue,
    },
  ]);

  await redis.hset(`key:${currentHash}`, field, Object.values(newValue)[0]);
};

keyManager();
