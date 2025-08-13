/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import CasualIcon from "~/public/icons/slime-ball.png";
import ClassicIcon from "~/public/icons/snowball.png";
import Image from "next/image";
import Link from "next/link";
import PvPIcon from "~/public/icons/ender-eye.png";
import { Background } from "~/components/ui/background";
import { Box } from "~/components/ui/box";
import { SkeletonBox } from "~/components/ui/skeleton-box";
import { Brand } from "~/components/icons/logo";
import { type Category, type Difficulty, type Reward, type Task, boards } from "./boards";
import { ComponentProps } from "react";
import { Divider } from "~/components/ui/divider";
import { MinecraftText } from "~/components/ui/minecraft-text";
import { Search } from "~/app/players/search";
import { SkeletonTab, Tabs } from "~/components/ui/tabs";
import { cn } from "~/lib/util";
import type { StaticImport } from "next/dist/shared/lib/get-img-props";
import { FormattedCategories } from "./bingo";



export default function BingoSkeleton() {
  return (
    <div className="grow">
      <div className="relative h-full mb-8">
        <Background
          background="bingo"
          className="h-full aspect-auto"
          mask="linear-gradient(rgb(255 255 255) 50%, rgb(0 0 0 / 0) calc(100% - 32px))"
        />
        <div className="absolute h-full w-full bg-[rgb(17_17_17_/0.7)] -z-10" />
        <div className="w-[95%] max-w-[1800px] mx-auto flex justify-center items-center flex-col gap-4">
          <Link href="/" className="absolute top-0 mt-3 scale-[0.75]">
            <Brand />
          </Link>
          <div className="flex flex-col gap-2 items-center mt-30 mb-4 lg:mb-8">
            <h1 className="text-mc-yellow text-mc-4 lg:text-mc-7 font-bold">Bingoify</h1>
            <h2 className="text-mc-gold text-mc-2 lg:text-mc-3">12th Anniversary Hypixel Bingo</h2>
          </div>
          <div className="w-[80%] flex items-stretch flex-col gap-4">
            <Search />
            <Divider variant="black" className="my-2" />
            <SkeletonBox>
              <div className="w-8 h-8" />
            </SkeletonBox>
            <SkeletonBox className="content:grid content:grid-cols-1 content:lg:grid-cols-3 content:gap-4 content:lg:gap-8">
              <SkeletonCategoryOverview icon={CasualIcon} category="casual" />
              <SkeletonCategoryOverview icon={PvPIcon} category="pvp" />
              <SkeletonCategoryOverview icon={ClassicIcon} category="classic" />
            </SkeletonBox>
            <Divider variant="black" />
            <div className="grid grid-cols-1 lg:grid-cols-[3fr_2px_2fr] items-center gap-4 **:text-mc-1.5 **:lg:text-mc-2">
              <Tabs defaultTab="casual">
                <SkeletonTab tab="casual">Casual</SkeletonTab>
                <SkeletonTab tab="pvp">PvP</SkeletonTab>
                <SkeletonTab tab="classic">Classic</SkeletonTab>
              </Tabs>
              <Divider orientation="vertical" className="h-[32px] hidden lg:block opacity-15" />
              <Tabs defaultTab="easy">
                <SkeletonTab tab="easy" className="text-mc-green/50 aria-pressed:text-mc-green">
                  Easy
                </SkeletonTab>
                <SkeletonTab tab="hard" className="text-mc-red/50 aria-pressed:text-mc-red">
                  Hard
                </SkeletonTab>
              </Tabs>
            </div>
          </div>
          <div className="flex flex-col justify-evenly w-full">
            <BingoBoard category="casual" difficulty="easy" />
          </div>
        </div>
      </div>
    </div>
  );
}

function SkeletonCategoryOverview({ category, icon }: { category: Category; icon: StaticImport }) {
  return (
    <div className="flex flex-col justify-center gap-1 lg:gap-3 text-center text-mc-1.5 lg:text-mc-2">
      <div className="flex gap-2 items-center justify-center">
        <Image
          src={icon}
          width={32}
          height={32}
          alt="icon"
          style={{ imageRendering: "pixelated" }}
          className="w-6 h-6 lg:w-8 lg:h-8"
        />
        <p className="font-bold text-mc-yellow">{FormattedCategories[category]} Bingo Cards</p>
      </div>
      <div className="flex flex-col justify-center gap-1">
        <p className="text-mc-gray">
          <span className="text-mc-green">Easy</span>:{" "}
          <span>0</span>
          <span className="text-mc-gray">/16</span> completed
        </p>
        <p className="text-mc-gray">
          <span className="text-mc-red">Hard</span>:{" "}
          <span>0</span>
          <span className="text-mc-gray">/16</span> completed
        </p>
      </div>
    </div>
  );
}

function BingoBoard<D extends Difficulty, C extends Category>({
  category,
  difficulty,
}: {
  category: C;
  difficulty: D;
}) {
  const board = boards[difficulty][category];

  return (
    <div className="overflow-x-auto grid grid-cols-[repeat(6,1fr)] grid-rows-6 gap-2 **:text-mc-1.25 md:**:text-mc-1.5 leading-4">
      <RewardCard key={`${difficulty}-${category}-diagonal-0`} reward={board.diagonalRewards[0]} />
      {board.columnRewards.map((reward) => (
        <RewardCard key={`${difficulty}-${category}-${reward.name}`} reward={reward} />
      ))}
      <RewardCard key={`${difficulty}-${category}-diagonal-1`} reward={board.diagonalRewards[1]} />
      <div className="row-start-2 col-start-2 grid grid-cols-subgrid grid-rows-subgrid row-span-4 col-span-4">
        {board.tasks.map((task) => (
          <TaskCard key={`${difficulty}-${category}-${task.field}`} task={task} />
        ))}
      </div>
      {board.rowRewards.map((reward) => (
        <RewardCard key={`${difficulty}-${category}-${reward.name}`} className="col-start-6" reward={reward} />
      ))}
      <RewardCard
        key={`${difficulty}-${category}-blackout`}
        className="col-start-6"
        reward={board.blackoutReward}
        variant="blackout"
      />
    </div>
  );
}

function RewardCard({
  className = "",
  variant = "regular",
  reward,
  ...props
}: { reward: Reward; variant?: "blackout" | "regular" } & Omit<ComponentProps<typeof Box>, "variant">) {
  return (
    <SkeletonBox {...props} className={`min-w-50 grow content:flex content:flex-col content:gap-2 ${className}`}>
      <p className={cn("font-bold text-mc-pink text-center", variant === "blackout" && "text-mc-dark-purple")}>
        {reward.name} Reward
      </p>
      {typeof reward.description === "string" ? (
        <MinecraftText>{reward.description}</MinecraftText>
      ) : (
        <div className="flex flex-col gap-0.5">
          {reward.description.map((part) => (
            <MinecraftText key={part}>{part}</MinecraftText>
          ))}
        </div>
      )}
    </SkeletonBox>
  );
}

function TaskCard({ task }: { task: Task }) {
  return (
    <SkeletonBox
      className="grow min-w-50 content:flex content:flex-col content:justify-between content:gap-2 content:text-center"
      variant="red"
    >
      <div className="flex flex-col gap-2">
        <div className="first:text-mc-red">
          <p className="font-bold text-center">{task.name}</p>
          <p className="text-mc-dark-gray text-center">{task.game} Task</p>
        </div>
        <p>{task.description}</p>
      </div>
      <p className="text-mc-gray">
        Progress:{" "}
        <span className="text-mc-red">
          0
        </span>
        <span className="text-mc-gray">/</span>
        <span className="text-mc-gray">{task.progress}</span>
      </p>
    </SkeletonBox>
  );
}
