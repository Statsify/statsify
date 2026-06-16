/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Aggregate, Query } from "mongoose";
import { startSentrySpan } from "@statsify/logger";

let mongooseInstrumented = false;

type InstrumentedQuery = Query<unknown, unknown> & {
  mongooseCollection?: { name?: string };
  op?: string;
};

type InstrumentedAggregate = Aggregate<unknown> & {
  _model?: {
    collection?: { name?: string };
    modelName?: string;
  };
};

export function instrumentMongooseQueries() {
  if (mongooseInstrumented) return;
  mongooseInstrumented = true;

  instrumentQueryExec();
  instrumentAggregateExec();
}

function instrumentQueryExec() {
  const exec = Query.prototype.exec;

  Query.prototype.exec = function instrumentedExec(
    this: InstrumentedQuery,
    ...args: Parameters<typeof exec>
  ): ReturnType<typeof exec> {
    const collection = this.mongooseCollection?.name ?? this.model.collection.name;
    const operation = this.op ?? "query";
    const span = startSentrySpan({
      op: "mongo.query",
      description: `${collection}.${operation}`,
      data: {
        "db.collection": collection,
        "db.operation": operation,
        "db.system": "mongodb",
        "mongoose.model": this.model.modelName,
      },
    });

    try {
      return exec.apply(this, args).finally(() => span?.end()) as ReturnType<
        typeof exec
      >;
    } catch (error) {
      span?.end();
      throw error;
    }
  };
}

function instrumentAggregateExec() {
  const exec = Aggregate.prototype.exec;

  Aggregate.prototype.exec = function instrumentedExec(
    this: InstrumentedAggregate,
    ...args: Parameters<typeof exec>
  ): ReturnType<typeof exec> {
    const model = this["_model"];
    const collection = model?.collection?.name ?? "unknown";
    const span = startSentrySpan({
      op: "mongo.query",
      description: `${collection}.aggregate`,
      data: {
        "db.collection": collection,
        "db.operation": "aggregate",
        "db.system": "mongodb",
        "mongoose.model": model?.modelName ?? "unknown",
      },
    });

    try {
      return exec.apply(this, args).finally(() => span?.end()) as ReturnType<
        typeof exec
      >;
    } catch (error) {
      span?.end();
      throw error;
    }
  };
}
