/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Background } from "~/components/ui/background";
import { BaseSection } from "./base-section";
import { Box } from "~/components/ui/box";
import { CardStack } from "~/components/ui/card-stack";
import { Command } from "~/components/ui/command";
import { MinecraftText } from "~/components/ui/minecraft-text";
import { Skin } from "~/components/ui/skin";
import { TableData } from "~/components/ui/table";
import type { Guild } from "@statsify/schemas";

export function GuildSection({ guild }: { guild: Guild }) {
  return (
    <BaseSection background="guild" className="flex-col items-center relative py-24">

      {/* <PlayerProvider player={player}>
        <SessionAnimation />
      </PlayerProvider> */}

      <CardStack>
        <GuildOverall guild={guild} />
        <GuildLevelling guild={guild} />
        <GuildTop guild={guild} />
        {/* <GuildMember guild={guild} /> */}
      </CardStack>

      <div className="mx-auto lg:mx-0 flex flex-col gap-4 max-w-120 xl:max-w-200 text-mc-white text-center lg:text-start">
        <h1 className="text-mc-4 lg:text-mc-7 font-bold text-mc-yellow text-center">Guilds</h1>
        <p className="text-mc-2 leading-6 text-center">Using session stats, Statsify allows you to display your stats as if you began playing today. There is no need to worry about your past losses, you can just focus on the now. To quickly obtain your session stats, type <Command>/session</Command> followed by the game of your choice. For example, enter <Command>/session tntgames</Command> to get your session TNT Games stats. Session stats are tracked independently of your overall stats so you can reset them via <Command>/reset session</Command>.</p>
      </div>
    </BaseSection>
  );
}

function GuildOverall({ guild }: { guild: Guild }) {
  return (
    <div className="p-4 relative shadow-md grid grid-cols-2 gap-2 isolate">
      <Background background="guild" className="h-full" />
      <Box containerClass="col-span-2 text-center"><MinecraftText className="text-mc-4">{guild.nameFormatted}</MinecraftText></Box>
      <Box><p className="text-mc-2 text-mc-gray text-center">Guild Info</p></Box>
      <Box><p className="text-mc-2 text-mc-gray text-center">Guild Description</p></Box>
      <Box containerClass="leading-[24px]">
        <p className="text-mc-aqua">
          Guild Master:{" "}<MinecraftText>{guild.members[1].displayName ?? ""}</MinecraftText>
        </p>
        <p className="text-mc-dark-aqua">
          Created On: <span className="text-mc-gray">{new Date(guild.createdAt).toLocaleString()}</span>
        </p>
        <p className="text-mc-blue">
          Guild Members: <span className="text-mc-white">{guild.members.length}</span><span className="text-mc-dark-gray">/</span><span className="text-mc-white">125</span>
        </p>
        <p className="text-mc-dark-green">
          GEXP: <span className="text-mc-white">{guild.exp}</span>
        </p>
        <p className="text-mc-yellow">
          Guild Level: <span className="text-mc-white">{guild.level}</span>
        </p>
      </Box>
      <Box containerClass="max-w-132 leading-[24px]">
        {guild.description}
      </Box>
      <Box containerClass="col-span-2 text-center"><p className="text-mc-2 text-mc-gray">Preferred Games</p></Box>
      <Box containerClass="col-span-2 text-center">
        <div className="flex gap-2 items-center justify-center">
          {guild.preferredGames.map((game) => <span key={game}>{game.slice(0, 3)}</span>)}
        </div>
      </Box>
    </div>
  );
}

function GuildLevelling({ guild }: { guild: Guild }) {
  return (
    <div className="p-4 relative shadow-md grid grid-cols-3 gap-2">
      <Background background="guild" className="h-full" />
      <Box containerClass="col-span-3 text-center"><MinecraftText className="text-mc-4">{guild.nameFormatted}</MinecraftText></Box>
      <Box containerClass="leading-[24px] col-span-3 text-center">
        <p className="text-mc-gray">
          Guild Level: <span className="text-mc-yellow">{guild.level}</span>
        </p>
        <p className="text-mc-gray">
          Progress: <span className="text-mc-aqua">{guild.progression.current}</span><span className="text-mc-gray">/</span><span className="text-mc-green">{guild.progression.current}</span>
        </p>
        <p>
          <span className="text-mc-yellow">{Math.ceil(guild.level)}</span> <span className="text-mc-dark-gray">[</span><span className="text-mc-yellow">{"|".repeat(20)}</span><span className="text-mc-gray">{"|".repeat(20)}</span><span className="text-mc-dark-gray">]</span> <span className="text-mc-yellow">{Math.ceil(guild.level) + 1}</span>
        </p>
      </Box>
      <Box containerClass="col-span-3 text-center"><p className="text-mc-2 text-mc-gray">Guild Experience</p></Box>
      <TableData title="Daily" value={guild.daily.toString()} color="text-mc-dark-green" />
      <TableData title="Weekly" value={guild.weekly.toString()} color="text-mc-dark-green" />
      <TableData title="Monthly" value={guild.monthly.toString()} color="text-mc-dark-green" />
    </div>
  );
}

function GuildTop({ guild }: { guild: Guild }) {
  return (
    <div className="p-4 relative shadow-md grid grid-cols-2 gap-2">
      <Background background="guild" className="h-full" />
      <Box containerClass="col-span-2 text-center"><MinecraftText className="text-mc-4">{guild.nameFormatted}</MinecraftText></Box>
      <Box containerClass="col-span-2 text-center"><p className="text-mc-dark-green font-bold">GEXP for Today</p></Box>
      <div className="flex gap-2">
        <Box borderRadius={{ right: 0 }} containerClass="font-bold">#1</Box>
        <Box borderRadius={{ left: 0, right: 0 }} containerClass="grow"><MinecraftText>{guild.members[0].displayName ?? ""}</MinecraftText></Box>
        <Box borderRadius={{ left: 0 }}>12345</Box>
      </div>
      <div className="flex gap-2">
        <Box borderRadius={{ right: 0 }} containerClass="font-bold">#2</Box>
        <Box borderRadius={{ left: 0, right: 0 }} containerClass="grow"><MinecraftText>{guild.members[1].displayName ?? ""}</MinecraftText></Box>
        <Box borderRadius={{ left: 0 }}>12345</Box>
      </div>
      <div className="flex gap-2">
        <Box borderRadius={{ right: 0 }} containerClass="font-bold">#3</Box>
        <Box borderRadius={{ left: 0, right: 0 }} containerClass="grow"><MinecraftText>{guild.members[2].displayName ?? ""}</MinecraftText></Box>
        <Box borderRadius={{ left: 0 }}>12345</Box>
      </div>
      <div className="flex gap-2">
        <Box borderRadius={{ right: 0 }} containerClass="font-bold">#4</Box>
        <Box borderRadius={{ left: 0, right: 0 }} containerClass="grow"><MinecraftText>{guild.members[3].displayName ?? ""}</MinecraftText></Box>
        <Box borderRadius={{ left: 0 }}>12345</Box>
      </div>
      <div className="flex gap-2">
        <Box borderRadius={{ right: 0 }} containerClass="font-bold">#5</Box>
        <Box borderRadius={{ left: 0, right: 0 }} containerClass="grow"><MinecraftText>{guild.members[4].displayName ?? ""}</MinecraftText></Box>
        <Box borderRadius={{ left: 0 }}>12345</Box>
      </div>
      <div className="flex gap-2">
        <Box borderRadius={{ right: 0 }} containerClass="font-bold">#6</Box>
        <Box borderRadius={{ left: 0, right: 0 }} containerClass="grow"><MinecraftText>{guild.members[5].displayName ?? ""}</MinecraftText></Box>
        <Box borderRadius={{ left: 0 }}>12345</Box>
      </div>
    </div>
  );
}

function GuildMember({ guild }: { guild: Guild }) {
  return (
    <div className="p-4 relative shadow-md">
      <Background background="guild" className="h-full" />
      <div className="flex gap-2">
        <Skin uuid={guild.members[8].uuid} contentClass="h-full" />
        <div className="flex flex-col gap-2">
          <Box>
            <span className="flex flex-row items-center gap-4">
              <MinecraftText className="text-mc-4">{guild.members[8].displayName ?? ""}</MinecraftText>
              <MinecraftText className="text-mc-3">{guild.tagFormatted}</MinecraftText>
            </span>
          </Box>
          <Box containerClass="leading-[24px] text-center">
            <p className="text-mc-gray">
              Guild: <span className="text-mc-yellow">{guild.name}</span>
            </p>
            <p className="text-mc-gray">
              Guild Rank: <span className="text-mc-yellow">{guild.members[8].rank}</span>
            </p>
            <p className="text-mc-gray">
              Joined At: <span className="text-mc-dark-aqua">{new Date(guild.members[8].joinTime).toLocaleString()}</span>
            </p>
            <p className="text-mc-gray">
              Guild Quests: <span className="text-mc-aqua">{guild.members[8].questParticipation}</span>
            </p>
          </Box>
          <Box containerClass="font-bold text-center">
            <span className="text-mc-dark-green">Guild Member</span> <span>Stats</span>
          </Box>
        </div>
      </div>
    </div>
  );
}
