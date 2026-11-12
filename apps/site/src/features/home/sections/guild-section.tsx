/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { BaseSection } from "./base-section";
import { Box } from "~/components/ui/box";
import { Carousel } from "~/components/ui/carousel";
import { Command } from "~/components/ui/command";
import { Fragment } from "react";
import { GameIcon, hasGameIcon } from "~/components/ui/game-icon";
import { MinecraftText } from "~/components/ui/minecraft-text";
import { Progression } from "~/components/ui/progression";
import { Skin } from "~/components/ui/skin";
import { TableData } from "~/components/ui/table";
import { cn } from "~/lib/util";
import { useTranslation } from "react-i18next";
import { useNumberFormat } from "~/i18n/use-number-format";
import type { GuildPreview, GuildPreviewMember } from "@statsify/contract";

/** Fixed timestamps, so server and browser print the same day whatever the visitor's time zone. */
const DATE = new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "2-digit", day: "2-digit", year: "numeric" });

export function GuildSection({ guild }: { guild: GuildPreview }) {
  return (
    <BaseSection
      background="guilds"
      className="flex-col items-center relative overflow-hidden"
    >
      <div className="hidden md:block">
        <Carousel className="backdrop-blur-2xl bg-black/40">
          <GuildOverall guild={guild} />
          <GuildLeveling guild={guild} />
          <GuildTop guild={guild} />
          {guild.member && <GuildMember guild={guild} member={guild.member} />}
        </Carousel>
      </div>
      <div className="block md:hidden">
        <GuildOverall guild={guild} className="shadow-none" />
      </div>
      <div className="mx-4 lg:mx-0 flex flex-col gap-4 max-w-120 xl:max-w-200 text-mc-white text-center lg:text-start">
        <h1 className="text-mc-4 lg:text-mc-7 font-bold text-mc-yellow text-center">
          Guilds
        </h1>
        <p className="text-mc-1.75 lg:text-mc-2 leading-6 text-center">
          Manage and keep track of your guild easier with Statsify. You can view
          all of the guild information needed within the{" "}
          <Command command="/guild" /> command. Want to see your guild top GEXP
          but lazy to log on? No problem! Just run{" "}
          <Command command="/guild top" /> and view your top grinders. Use{" "}
          <Command command="/guild member" /> to view your player information
          inside your guild. And many more commands like{" "}
          <Command command="/guild leaderboard" /> and{" "}
          <Command command="/guild overall" />.
        </p>
      </div>
      <div className="h-20 w-full" />
    </BaseSection>
  );
}

function GuildOverall({ guild, className }: { guild: GuildPreview; className?: string }) {
  const n = useNumberFormat();

  return (
    <div className={cn("relative grid grid-cols-1 xl:grid-cols-2 gap-2 p-4 z-10 shadow-[8px_8px_0_rgb(0_0_0_/_0.5)]", className)}>
      <Box className="xl:col-span-2 text-center">
        <MinecraftText className="text-mc-3 md:text-mc-4">
          {guild.nameFormatted}
        </MinecraftText>
      </Box>
      <Box className="row-start-2">
        <p className="text-mc-2 text-mc-gray text-center">Guild Info</p>
      </Box>
      <Box className="hidden xl:block xl:row-start-2">
        <p className="text-mc-2 text-mc-gray text-center">Guild Description</p>
      </Box>
      <Box className="row-start-3 leading-[24px]">
        {guild.master && (
          <p className="text-mc-aqua flex gap-2">
            <span className="hidden lg:block">Guild Master: </span>
            <span className="block lg:hidden">GM: </span>
            <MinecraftText>{guild.master}</MinecraftText>
          </p>
        )}
        <p className="text-mc-dark-aqua">
          Created On:{" "}
          <span className="text-mc-gray">
            {DATE.format(new Date(guild.createdAt))}
          </span>
        </p>
        <p className="text-mc-blue">
          Guild Members:{" "}
          <span className="text-mc-white">{guild.memberCount}</span>
          <span className="text-mc-dark-gray">/</span>
          <span className="text-mc-white">125</span>
        </p>
        <p className="text-mc-dark-green">
          GEXP: <span className="text-mc-white">{n(guild.exp)}</span>
        </p>
        <p className="text-mc-yellow">
          Guild Level: <span className="text-mc-white">{guild.level}</span>
        </p>
      </Box>
      <Box className="hidden xl:block xl:row-start-3 xl:max-w-120 leading-[24px] text-ellipsis">
        {guild.description}
      </Box>
      <Box className="col-span-2 text-center">
        <p className="text-mc-2 text-mc-gray ">Preferred Games</p>
      </Box>
      <Box className="col-span-2 text-center">
        <div className="flex gap-2 items-center justify-center flex-wrap max-w-80 lg:max-w-none">
          {guild.preferredGames.map(({ id, name }) => hasGameIcon(id) && <GameIcon key={id} game={id} alt={name} />)}
        </div>
      </Box>
    </div>
  );
}

function GuildLevelling({ guild }: { guild: GuildPreview }) {
  const n = useNumberFormat();
  const { t } = useTranslation();
  const color = guild.tagColor;

  return (
    <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-2 p-4 shadow-[8px_8px_0_rgb(0_0_0_/_0.5)]">
      <Box className="lg:col-span-3 text-center">
        <MinecraftText className="text-mc-3 md:text-mc-4 ">
          {guild.nameFormatted}
        </MinecraftText>
      </Box>
      <Box className="leading-[24px] lg:col-span-3 text-center">
        <Progression
          currentLevel={`${color}${Math.floor(guild.level)}`}
          nextLevel={`${color}${Math.floor(guild.level) + 1}`}
          label="Guild Level"
          metric=""
          progression={guild.progression}
          xpBar={(percentage) => {
            const max = 40;
            const count = Math.ceil(max * percentage);
            return `§8[${color}${"|".repeat(count)}§7${"|".repeat(
              max - count
            )}§8]`;
          }}
        />
      </Box>
      <Box className="lg:col-span-3 text-center">
        <p className="text-mc-2 text-mc-gray">Guild Experience</p>
      </Box>
      <TableData
        title={t("default:stats.guild.daily")}
        value={n(guild.daily)}
        color="text-mc-dark-green"
      />
      <TableData
        title={t("default:stats.guild.weekly")}
        value={n(guild.weekly)}
        color="text-mc-dark-green"
      />
      <TableData
        title={t("default:stats.guild.monthly")}
        value={n(guild.monthly)}
        color="text-mc-dark-green"
      />
    </div>
  );
}

function GuildTop({ guild }: { guild: GuildPreview }) {
  const n = useNumberFormat();
  return (
    <div className="relative grid grid-cols-content-3 xl:grid-cols-content-6 gap-2 p-4 shadow-[8px_8px_0_rgb(0_0_0_/_0.5)]">
      <Box className="col-span-full text-center">
        <MinecraftText className="text-mc-3 md:text-mc-4">
          {guild.nameFormatted}
        </MinecraftText>
      </Box>
      <Box className="col-span-full text-center text-mc-dark-green font-bold">
        GEXP for Today
      </Box>
      {guild.topDaily.map((member, index) => (
        <Fragment key={member.uuid}>
          <Box
            className="font-bold content:flex content:items-center"
            borderRadius={{ right: 0 }}
          >
            #{index + 1}
          </Box>
          <Box
            className="grow content:flex content:items-center"
            borderRadius={{ left: 0, right: 0 }}
          >
            <MinecraftText className="truncate">{member.displayName}</MinecraftText>
          </Box>
          <Box
            className="content:flex content:items-center"
            borderRadius={{ left: 0 }}
          >
            {n(member.daily)}
          </Box>
        </Fragment>
      ))}
    </div>
  );
}

function GuildMember({ guild, member }: { guild: GuildPreview; member: GuildPreviewMember }) {
  const n = useNumberFormat();
  const { t } = useTranslation();

  return (
    <div className="relative grid grid-cols-content-1 lg:grid-cols-content-2 gap-2 p-4 shadow-[8px_8px_0_rgb(0_0_0_/_0.5)]">
      <Skin uuid={member.uuid} className="row-span-3 hidden lg:block" />
      <Box className="content:flex content:justify-center content:items-center content:gap-4">
        <MinecraftText className="text-mc-3 md:text-mc-4">
          {member.displayName}
        </MinecraftText>
        <p className="hidden lg:block text-mc-3">
          <MinecraftText>{guild.tagFormatted}</MinecraftText>
        </p>
      </Box>
      <Box className="leading-[24px] text-center">
        <p className="text-mc-gray">
          Guild: <span className="text-mc-yellow">{guild.name}</span>
        </p>
        <p className="text-mc-gray">
          Guild Rank: <span className="text-mc-yellow">{member.rank}</span>
        </p>
        <p className="text-mc-gray">
          Joined At:{" "}
          <span className="text-mc-dark-aqua">
            {DATE.format(new Date(member.joinTime))}
          </span>
        </p>
        <p className="text-mc-gray">
          Guild Quests:{" "}
          <span className="text-mc-aqua">{n(member.questParticipation)}</span>
        </p>
      </Box>
      <Box className="font-bold text-center">
        <span className="text-mc-dark-green">Guild Member</span>{" "}
        <span>{t("home.stats")}</span>
      </Box>
      <div className="col-span-full grid grid-cols-1 lg:grid-cols-[repeat(3,1fr)] gap-2">
        <TableData
          color="text-mc-dark-green"
          title={t("default:stats.guild.daily")}
          value={n(member.daily)}
        />
        <TableData
          color="text-mc-dark-green"
          title={t("default:stats.guild.weekly")}
          value={n(member.weekly)}
        />
        <TableData
          color="text-mc-dark-green"
          title={t("default:stats.guild.monthly")}
          value={n(member.monthly)}
        />
      </div>
    </div>
  );
}
