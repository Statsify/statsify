/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { DateTime } from "luxon";
import { config } from "@statsify/util";
import { connect } from "mongoose";

const mongo = await connect(config("database.mongoUri"));
const now = DateTime.now();

const getNextResetTime = (resetMinute, time) => {
  const hasResetToday = (resetMinute ?? 0) <= now.hour * 60 + now.minute;

  let resetTime = now
    .minus({ hours: now.hour, minutes: now.minute })
    .plus({ minutes: resetMinute ?? 0 });

  const isSunday = now.weekday === 7;
  const isStartOfMonth = now.day === 1;

  if (time === "d" && hasResetToday) {
    resetTime = resetTime.plus({ days: 1 });
  } else if (time === "w" && ((isSunday && hasResetToday) || !isSunday)) {
    resetTime = resetTime.plus({ week: 1 }).minus({ days: isSunday ? 0 : now.weekday });
  } else if (time === "m" && ((isStartOfMonth && hasResetToday) || !isStartOfMonth)) {
    resetTime = resetTime.minus({ days: now.day - 1 }).plus({ months: 1 });
  }

  return Math.round(resetTime.toMillis() / 1000);
};

const getLastResetTime = (resetMinute, time) => {
  const dNow = Math.round(now.toMillis() / 1000);

  return dNow - (getNextResetTime(resetMinute, time) - dNow);
};

const setTimestamps = async (collectionName) => {
  const collection = mongo.connection.db.collection(collectionName);
  const players = await collection
    .find({ lastReset: { $exists: false } }, { projection: { resetMinute: 1 } })
    .toArray();

  const bulkOperations = [];

  players.forEach((pm) => {
    const nextReset = getNextResetTime(pm.resetMinute, collectionName);
    const lastReset = getLastResetTime(pm.resetMinute, collectionName);

    bulkOperations.push({
      updateOne: {
        filter: { _id: pm._id },
        update: { $set: { nextReset, lastReset } },
      },
    });
  });

  if (!bulkOperations.length)
    return console.log(`No players to update for ${collectionName}.`);
  collection.bulkWrite(bulkOperations).then((res) => {
    console.log(
      `Updated ${res.modifiedCount}/${players.length} players for ${collectionName}.`
    );
  });
};

await setTimestamps("daily");
await setTimestamps("weekly");
await setTimestamps("monthly");

console.log(`Done! Took ${DateTime.now().diff(now).as("seconds")} seconds.`);
