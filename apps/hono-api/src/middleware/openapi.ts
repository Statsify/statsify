/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import type { Hono, MiddlewareHandler } from "hono";
import type { OpenAPIV3_1 } from "openapi-types";

export const OpenApiSymbol = Symbol("StatsifyOpenApiSymbol");

type OpenApiRouteOptions = OpenAPIV3_1.OperationObject;

export function openapi(options: OpenApiRouteOptions) {
  // Middleware needs to be defined in the openapi function since each route will have specific metadata attached to its middleware
  // eslint-disable-next-line unicorn/consistent-function-scoping
  const middleware: MiddlewareHandler = (c, next) => next();

  Object.assign(middleware, {
    [OpenApiSymbol]: options,
  });

  return middleware;
}

export function createOpenApiDocs(app: Hono, document: Omit<OpenAPIV3_1.Document, "tags" | "paths" | "openapi">): OpenAPIV3_1.Document {
  const paths: OpenAPIV3_1.PathsObject = {};
  const tags = new Set<string>();

  for (const route of app.routes) {
    // route.handler;
    if (!(OpenApiSymbol in route.handler)) continue;

    const method = route.method.toLowerCase() as OpenAPIV3_1.HttpMethods;
    const docs = route.handler[OpenApiSymbol] as OpenAPIV3_1.OperationObject;

    if (docs.tags) docs.tags.forEach((tag) => tags.add(tag));
    console.log(route.method, route.path, docs);

    if (!(route.path in paths)) paths[route.path] = {};
    const path = paths[route.path]!;

    if (!(method in path)) path[method] = {};

    path[method] = {
      ...path[method],
      ...docs,
    };
  }

  return {
    ...document,
    openapi: "3.1.0",
    tags: [...tags.values()].map((tag) => ({ name: tag })),
    paths,
  };
}
