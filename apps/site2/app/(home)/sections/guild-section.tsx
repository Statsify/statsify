/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { BaseSection } from "./base-section";
import { Box } from "~/components/ui/box";
import { Carousel } from "~/components/ui/carousel";
import { Command } from "~/components/ui/command";
import { Fragment } from "react";
import { GameIcon } from "~/components/ui/game-icon";
import { MinecraftText } from "~/components/ui/minecraft-text";
import { Progression } from "~/components/ui/progression";
import { Skin } from "~/components/ui/skin";
import { TableData } from "~/components/ui/table";
import { formatDate } from "date-fns";
import { t } from "~/localize";
import type { Guild } from "@statsify/schemas";

export function GuildSection({ guild }: { guild: Guild }) {
  return (
    <BaseSection background="guilds" className="flex-col items-center relative overflow-hidden">
      <Carousel className="backdrop-blur-2xl bg-black/40">
        <GuildOverall guild={guild} />
        <GuildLevelling guild={guild} />
        <GuildTop guild={guild} />
        <GuildMember guild={guild} />
      </Carousel>
      <div className="mx-auto lg:mx-0 flex flex-col gap-4 max-w-120 xl:max-w-200 text-mc-white text-center lg:text-start">
        <h1 className="text-mc-4 lg:text-mc-7 font-bold text-mc-yellow text-center">Guilds</h1>
        <p className="text-mc-2 leading-6 text-center">
          Manage and keep track of your guild easier with Statsify. You can view all of the guild information needed
          within the <Command>/guild</Command> command. Want to see your guild top GEXP but lazy to log on? No problem!
          Just run <Command>/guild top</Command> and view your top grinders. Use <Command>/guild member</Command> to
          view your player information inside your guild. And many more commands like{" "}
          <Command>/guild leaderboard</Command> and <Command>/guild overall</Command>.
        </p>
      </div>
      <div className="h-20 w-full" />
    </BaseSection>
  );
}

function GuildOverall({ guild }: { guild: Guild }) {
  return (
    <div className="relative grid grid-cols-1 xl:grid-cols-2 gap-2 p-4 z-10 shadow-[8px_8px_0_rgb(0_0_0_/_0.5)]">
      <Box className="container:xl:col-span-2 container:text-center">
        <MinecraftText className="text-mc-4">{guild.nameFormatted}</MinecraftText>
      </Box>
      <Box className="container:row-start-2">
        <p className="text-mc-2 text-mc-gray text-center">Guild Info</p>
      </Box>
      <Box className="container:hidden container:xl:block container:xl:row-start-2">
        <p className="text-mc-2 text-mc-gray text-center">Guild Description</p>
      </Box>
      <Box className="container:row-start-3 container:leading-[24px]">
        <p className="text-mc-aqua flex gap-2">
          <span className="hidden lg:block">Guild Master: </span>
          <span className="block lg:hidden">GM: </span>
          <MinecraftText>{guild.members[1].displayName ?? ""}</MinecraftText>
        </p>
        <p className="text-mc-dark-aqua">
          Created On: <span className="text-mc-gray">{formatDate(new Date(guild.createdAt), "MM/dd/yyyy")}</span>
        </p>
        <p className="text-mc-blue">
          Guild Members: <span className="text-mc-white">{guild.members.length}</span>
          <span className="text-mc-dark-gray">/</span>
          <span className="text-mc-white">125</span>
        </p>
        <p className="text-mc-dark-green">
          GEXP: <span className="text-mc-white">{t(guild.exp)}</span>
        </p>
        <p className="text-mc-yellow">
          Guild Level: <span className="text-mc-white">{guild.level}</span>
        </p>
      </Box>
      <Box className="container:hidden container:xl:block container:xl:row-start-3 container:xl:max-w-120 container:leading-[24px] container:text-ellipsis">
        {guild.description}
      </Box>
      <Box className="container:col-span-2 container:text-center">
        <p className="text-mc-2 text-mc-gray ">Preferred Games</p>
      </Box>
      <Box className="container:col-span-2 container:text-center">
        <div className="flex gap-2 items-center justify-center flex-wrap max-w-80 lg:max-w-none">
          {guild.preferredGames.map((game) => (
            <GameIcon key={game} game={game} />
          ))}
        </div>
      </Box>
    </div>
  );
}

function GuildLevelling({ guild }: { guild: Guild }) {
  const color = guild.tagColor.code;

  return (
    <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-2 p-4 shadow-[8px_8px_0_rgb(0_0_0_/_0.5)]">
      <Box className="container:lg:col-span-3 container:text-center">
        <MinecraftText className="text-mc-4">{guild.nameFormatted}</MinecraftText>
      </Box>
      <Box className="container:leading-[24px] container:lg:col-span-3 container:text-center">
        <Progression
          currentLevel={`${color}${Math.floor(guild.level)}`}
          nextLevel={`${color}${Math.floor(guild.level) + 1}`}
          label="Guild Level"
          metric=""
          progression={guild.progression}
          xpBar={(percentage) => {
            const max = 40;
            const count = Math.ceil(max * percentage);
            return `§8[${color}${"|".repeat(count)}§7${"|".repeat(max - count)}§8]`;
          }}
        />
      </Box>
      <Box className="container:lg:col-span-3 container:text-center">
        <p className="text-mc-2 text-mc-gray">Guild Experience</p>
      </Box>
      <TableData title="Daily" value={t(guild.daily)} color="text-mc-dark-green" />
      <TableData title="Weekly" value={t(guild.weekly)} color="text-mc-dark-green" />
      <TableData title="Monthly" value={t(guild.monthly)} color="text-mc-dark-green" />
    </div>
  );
}

function GuildTop({ guild }: { guild: Guild }) {
  const members = guild.members.toSorted((a, b) => b.daily - a.daily).slice(0, 6);

  return (
    <div className="relative grid grid-cols-content-3 xl:grid-cols-content-6 gap-2 p-4 shadow-[8px_8px_0_rgb(0_0_0_/_0.5)]">
      <Box className="container:col-span-full container:text-center">
        <MinecraftText className="text-mc-4">{guild.nameFormatted}</MinecraftText>
      </Box>
      <Box className="container:col-span-full container:text-center container:text-mc-dark-green container:font-bold">GEXP for Today</Box>
      {members.map((member, index) => (
        <Fragment key={member.uuid}>
          <Box className="container:font-bold flex items-center" borderRadius={{ right: 0 }}>
            #{index + 1}
          </Box>
          <Box className="container:grow flex items-center" borderRadius={{ left: 0, right: 0 }}>
            <MinecraftText>{member.displayName ?? ""}</MinecraftText>
          </Box>
          <Box className="flex items-center" borderRadius={{ left: 0 }}>
            {t(member.daily)}
          </Box>
        </Fragment>
      ))}
    </div>
  );
}

function GuildMember({ guild }: { guild: Guild }) {
  const member = guild.members[8];

  return (
    <div className="relative grid grid-cols-content-1 lg:grid-cols-content-2 gap-2 p-4 shadow-[8px_8px_0_rgb(0_0_0_/_0.5)]">
      <Skin uuid={member.uuid} className="container:row-span-3 container:hidden container:lg:block" />
      <Box className="flex justify-center items-center gap-4">
        <MinecraftText className="text-mc-4">{member.displayName ?? ""}</MinecraftText>
        <p className="hidden lg:block text-mc-3">
          <MinecraftText>{guild.tagFormatted}</MinecraftText>
        </p>
      </Box>
      <Box className="container:leading-[24px] container:text-center">
        <p className="text-mc-gray">
          Guild: <span className="text-mc-yellow">{guild.name}</span>
        </p>
        <p className="text-mc-gray">
          Guild Rank: <span className="text-mc-yellow">{member.rank}</span>
        </p>
        <p className="text-mc-gray">
          Joined At: <span className="text-mc-dark-aqua">{formatDate(new Date(member.joinTime), "MM/dd/yyy")}</span>
        </p>
        <p className="text-mc-gray">
          Guild Quests: <span className="text-mc-aqua">{t(member.questParticipation)}</span>
        </p>
      </Box>
      <Box className="container:font-bold container:text-center">
        <span className="text-mc-dark-green">Guild Member</span> <span>Stats</span>
      </Box>
      <div className="col-span-full grid grid-cols-1 lg:grid-cols-[repeat(3,1fr)] gap-2">
        <TableData color="text-mc-dark-green" title="Daily" value={t(member.daily)} />
        <TableData color="text-mc-dark-green" title="Weekly" value={t(member.weekly)} />
        <TableData color="text-mc-dark-green" title="Monthly" value={t(member.monthly)} />
      </div>
    </div>
  );
}
