/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  addDays,
  addMinutes,
  addMonths,
  addWeeks,
  getDate,
  getHours,
  getISODay,
  getMinutes,
  subDays,
  subMinutes,
  subWeeks,
} from "date-fns";
import { config } from "@statsify/util";
import { connect } from "mongoose";

const mongo = await connect(config("database.mongoUri"));
const now = new Date();
const minutesToday = getHours(now) * 60 + getMinutes(now);
const weekday = getISODay(now);
const day = getDate(now);

const getNextResetTime = (resetMinute, time) => {
  const hasResetToday = (resetMinute ?? 0) <= minutesToday;

  let resetTime = addMinutes(now, (resetMinute ?? 0) - minutesToday);

  const isSunday = weekday === 7;
  const isStartOfMonth = day === 1;

  if (time === "daily" && hasResetToday) {
    resetTime = addDays(resetTime, 1);
  } else if (time === "weekly" && ((isSunday && hasResetToday) || !isSunday)) {
    resetTime = subDays(addWeeks(resetTime, 1), isSunday ? 0 : weekday);
  } else if (
    time === "monthly" &&
    ((isStartOfMonth && hasResetToday) || !isStartOfMonth)
  ) {
    resetTime = addMonths(subDays(resetTime, day - 1), 1);
  }

  return Math.round(resetTime.getTime() / 1000);
};

// Calculate how long ago the last reset was. Basically the inverse of getNextResetTime.
const getLastResetTime = (resetMinute, time) => {
  const hasResetToday = (resetMinute ?? 0) <= minutesToday;

  let resetTime = addMinutes(now, (resetMinute ?? 0) - minutesToday);

  const isSunday = weekday === 7;
  const isStartOfMonth = day === 1;

  if (time === "daily" && !hasResetToday) {
    resetTime = subMinutes(resetTime, resetMinute ?? 0);
  } else if (time === "weekly" && ((isSunday && hasResetToday) || !isSunday)) {
    resetTime = addDays(subWeeks(resetTime, 1), isSunday ? 0 : weekday);
  } else if (
    time === "monthly" &&
    ((isStartOfMonth && hasResetToday) || !isStartOfMonth)
  ) {
    resetTime = subDays(resetTime, day - 1);
  }

  return Math.round(resetTime.getTime() / 1000);
};

const setTimestamps = async (collectionName) => {
  const collection = mongo.connection.db.collection(collectionName);
  const players = await collection
    .find({ lastReset: { $exists: false } }, { projection: { resetMinute: 1 } })
    .toArray();

  const bulkOperations = [];

  for (const player of players) {
    const nextReset = getNextResetTime(player.resetMinute, collectionName);
    const lastReset = getLastResetTime(player.resetMinute, collectionName);

    bulkOperations.push({
      updateOne: {
        // mongodb object id's have a leading underscore
        // oxlint-disable-next-line no-underscore-dangle
        filter: { _id: player._id },
        update: { $set: { nextReset, lastReset } },
      },
    });
  }

  if (bulkOperations.length === 0)
    return console.log(`No players to update for ${collectionName}.`);
  
  const repsonse = await collection.bulkWrite(bulkOperations);
  
  console.log(
    `Updated ${repsonse.modifiedCount}/${players.length} players for ${collectionName}.`
  );
};

await setTimestamps("daily");
await setTimestamps("weekly");
await setTimestamps("monthly");

console.log(`Done! Took ${(Date.now() - now.getTime()) / 1000} seconds.`);
