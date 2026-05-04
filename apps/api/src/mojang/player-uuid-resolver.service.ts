/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  BadGatewayException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { HttpService } from "@nestjs/axios";

interface MojangProfile {
  id: string;
}

@Injectable()
export class PlayerUuidResolverService {
  public constructor(private readonly httpService: HttpService) {}

  public async resolvePlayerUuid(input: string): Promise<string> {
    if (this.isUuid(input)) return this.normalizeUuid(input);

    try {
      const response = await this.httpService.axiosRef.get<MojangProfile>(
        `https://api.mojang.com/users/profiles/minecraft/${input}`,
        { validateStatus: () => true }
      );

      if (response.status === 200 && response.data?.id) {
        return this.normalizeUuid(response.data.id);
      }

      if (response.status === 404) {
        throw new NotFoundException("Player name could not be resolved to a UUID");
      }

      throw new BadGatewayException("Failed to reach Mojang API");
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadGatewayException) {
        throw error;
      }

      throw new BadGatewayException("Failed to reach Mojang API");
    }
  }

  private isUuid(input: string) {
    return /^[0-9a-f]{32}$/i.test(input) || /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(input);
  }

  private normalizeUuid(uuid: string) {
    return uuid.replaceAll("-", "").toLowerCase();
  }
}
