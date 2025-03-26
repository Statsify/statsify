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
import { MinecraftText } from "~/components/ui/minecraft-text";
import { Skin } from "~/components/ui/skin";
import { TableData } from "~/components/ui/table";
import { formatDate } from "date-fns";
import { t } from "~/localize";
import type { Guild } from "@statsify/schemas";

export function GuildSection({ guild }: { guild: Guild }) {
  return (
    <BaseSection background="guild" className="flex-col items-center relative py-24 overflow-hidden">
      <Carousel className="backdrop-blur-2xl bg-black/40">
        <GuildOverall guild={guild} />
        <GuildLevelling guild={guild} />
        <GuildTop guild={guild} />
        <GuildMember guild={guild} />
      </Carousel>
      <div className="mx-auto lg:mx-0 flex flex-col gap-4 max-w-120 xl:max-w-200 text-mc-white text-center lg:text-start">
        <h1 className="text-mc-4 lg:text-mc-7 font-bold text-mc-yellow text-center">Guilds</h1>
        <p className="text-mc-2 leading-6 text-center">Using session stats, Statsify allows you to display your stats as if you began playing today. There is no need to worry about your past losses, you can just focus on the now. To quickly obtain your session stats, type <Command>/session</Command> followed by the game of your choice. For example, enter <Command>/session tntgames</Command> to get your session TNT Games stats. Session stats are tracked independently of your overall stats so you can reset them via <Command>/reset session</Command>.</p>
      </div>
    </BaseSection>
  );
}

function GuildOverall({ guild }: { guild: Guild }) {
  return (
    <div className="relative grid grid-cols-1 xl:grid-cols-2 gap-2 p-4 z-10 shadow-[8px_8px_0_rgb(0_0_0_/_0.5)]">
      <Box containerClass="xl:col-span-2 text-center"><MinecraftText className="text-mc-4">{guild.nameFormatted}</MinecraftText></Box>
      <Box containerClass="row-start-2"><p className="text-mc-2 text-mc-gray text-center">Guild Info</p></Box>
      <Box containerClass="hidden xl:block xl:row-start-2"><p className="text-mc-2 text-mc-gray text-center">Guild Description</p></Box>
      <Box containerClass="row-start-3 leading-[24px]">
        <p className="text-mc-aqua flex gap-2">
          <span className="hidden lg:block">Guild Master: </span>
          <span className="block lg:hidden">GM:{" "}</span>
          <MinecraftText>{guild.members[1].displayName ?? ""}</MinecraftText>
        </p>
        <p className="text-mc-dark-aqua">
          Created On: <span className="text-mc-gray">{formatDate(new Date(guild.createdAt), "MM/dd/yyyy")}</span>
        </p>
        <p className="text-mc-blue">
          Guild Members: <span className="text-mc-white">{guild.members.length}</span><span className="text-mc-dark-gray">/</span><span className="text-mc-white">125</span>
        </p>
        <p className="text-mc-dark-green">
          GEXP: <span className="text-mc-white">{t(guild.exp)}</span>
        </p>
        <p className="text-mc-yellow">
          Guild Level: <span className="text-mc-white">{guild.level}</span>
        </p>
      </Box>
      <Box containerClass="hidden xl:block xl:row-start-3 xl:max-w-120 leading-[24px] text-ellipsis">
        {guild.description}
      </Box>
      <Box containerClass="col-span-2 text-center"><p className="text-mc-2 text-mc-gray ">Preferred Games</p></Box>
      <Box containerClass="col-span-2 text-center">
        <div className="flex gap-2 items-center justify-center flex-wrap max-w-80 lg:max-w-none">
          {guild.preferredGames.map((game) => <div className="w-8 h-8 bg-red-200" key={game}></div>)}
        </div>
      </Box>
    </div>
  );
}

function GuildLevelling({ guild }: { guild: Guild }) {
  return (
    <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-2 p-4 shadow-[8px_8px_0_rgb(0_0_0_/_0.5)]">
      <Box containerClass="lg:col-span-3 text-center"><MinecraftText className="text-mc-4">{guild.nameFormatted}</MinecraftText></Box>
      <Box containerClass="leading-[24px] lg:col-span-3 text-center">
        <p className="text-mc-gray">
          Guild Level: <span className="text-mc-yellow">{t(guild.level)}</span>
        </p>
        <p className="text-mc-gray">
          Progress: <span className="text-mc-aqua">{guild.progression.current}</span><span className="text-mc-gray">/</span><span className="text-mc-green">{guild.progression.current}</span>
        </p>
        <p>
          <span className="text-mc-yellow">{Math.ceil(guild.level)}</span> <span className="text-mc-dark-gray">[</span><span className="text-mc-yellow">{"|".repeat(20)}</span><span className="text-mc-gray">{"|".repeat(20)}</span><span className="text-mc-dark-gray">]</span> <span className="text-mc-yellow">{Math.ceil(guild.level) + 1}</span>
        </p>
      </Box>
      <Box containerClass="lg:col-span-3 text-center"><p className="text-mc-2 text-mc-gray">Guild Experience</p></Box>
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
      <Box containerClass="col-span-full text-center"><MinecraftText className="text-mc-4">{guild.nameFormatted}</MinecraftText></Box>
      <Box containerClass="col-span-full text-center text-mc-dark-green font-bold">GEXP for Today</Box>
      {members.map((member, index) => (
        <Fragment key={member.uuid}>
          <Box contentClass="flex items-center" borderRadius={{ right: 0 }} containerClass="font-bold">#{index + 1}</Box>
          <Box contentClass="flex items-center" borderRadius={{ left: 0, right: 0 }} containerClass="grow">
            <MinecraftText>{member.displayName ?? ""}</MinecraftText>
          </Box>
          <Box contentClass="flex items-center" borderRadius={{ left: 0 }}>{t(member.daily)}</Box>
        </Fragment>
      ))}
    </div>
  );
}

function GuildMember({ guild }: { guild: Guild }) {
  const member = guild.members[8];

  return (
    <div className="relative grid grid-cols-content-1 lg:grid-cols-content-2 gap-2 p-4 shadow-[8px_8px_0_rgb(0_0_0_/_0.5)]">
      <Skin uuid={member.uuid} containerClass="row-span-3 hidden lg:block" contentClass="h-full" />
      <Box contentClass="flex items-center gap-4">
        <MinecraftText className="text-mc-4">{member.displayName ?? ""}</MinecraftText>
        <p className="hidden lg:block text-mc-3"><MinecraftText>{guild.tagFormatted}</MinecraftText></p>
      </Box>
      <Box containerClass="leading-[24px] text-center">
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
      <Box containerClass="font-bold text-center">
        <span className="text-mc-dark-green">Guild Member</span> <span>Stats</span>
      </Box>
    </div>
  );
}
