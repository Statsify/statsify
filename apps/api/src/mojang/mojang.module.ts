/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { PlayerUuidResolverService } from "./player-uuid-resolver.service.js";

@Module({
  imports: [HttpModule.register({})],
  providers: [PlayerUuidResolverService],
  exports: [PlayerUuidResolverService],
})
export class MojangModule {}
