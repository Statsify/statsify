/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import axios from "axios";
import { Theme, loadImage } from "@statsify/rendering";
import { getBackground } from "@statsify/assets";

export interface Server {
  ip: string;
  port: number;
  debug: {
    ping: boolean;
    query: boolean;
    srv: boolean;
    querymismatch: boolean;
    cnameinsrv: boolean;
    animatedmotd: boolean;
    cachetime: number;
    apiversion: number;
  };
  motd: {
    raw: string[];
    clean: string[];
    html: string[];
  };
  players: {
    online: number;
    max: number;
  };
  version?: string;
  online: boolean;
  protocol: number;
  hostname: string;
  name: string;
  icon: string;
  ping: number;
  mapping?: ServerMappingsServer;
}

export interface ServerMappingsServer {
  id: string;
  name: string;
  addresses: string[];
  primaryAddress: string;
  inactive: boolean;
  enriched: boolean;
}

const SERVER_MAPPINGS_CDN_URL = "https://servermappings.lunarclientcdn.com";

export async function getServerMappings() {
  const servers = await axios
    .get<ServerMappingsServer[]>(`${SERVER_MAPPINGS_CDN_URL}/servers.json`)
    .then((res) => res.data)
    .catch(() => []);

  return servers.filter((s) => !s.inactive && s.enriched);
}

export async function getServerBackground(theme: Theme | undefined, server?: ServerMappingsServer) {
  if (!server?.id || !server?.enriched) return getBackground("minecraft", "overall", theme?.context.boxColorId ?? "orange");

  try {
    const background = await loadImage(`${SERVER_MAPPINGS_CDN_URL}/backgrounds/${server.id}.png`);
    return background;
  } catch {
    return getBackground("minecraft", "overall", theme?.context.boxColorId ?? "orange");
  }
}
