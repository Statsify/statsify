/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

"use client";

import Image from "next/image";
import SkyWarsIcon from "~/public/icons/skywars.png";
import { Background } from "~/components/ui/background";
import { Box } from "~/components/ui/box";
import { type Category, type Difficulty, boards } from "./boards";
import { ComponentProps, useState } from "react";
import { MinecraftText } from "~/components/ui/minecraft-text";
import { SearchIcon } from "~/components/icons/search";
import { cn } from "~/lib/util";
import type { Player } from "@statsify/schemas";

export function BingoPage({ player }: { player: Player }) {
  const [category, setCategory] = useState<Category>("casual");
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");

  console.log(player.stats.general.bingo);

  return (
    <div className="h-full">
      <Background
        background="background"
        className="h-full aspect-auto"
        mask="linear-gradient(rgb(255 255 255) 20%, rgb(0 0 0 / 0) 95%)"
      />
      <div className="absolute h-[100dvh] w-full bg-[rgb(17_17_17_/0.7)] -z-10" />
      <div className="w-[95%] max-w-[1800px] mx-auto flex justify-center items-center flex-col gap-4">
        <div className="flex flex-col gap-2 items-center mt-12 mb-4 lg:mb-8">
          <h1 className="text-mc-yellow text-mc-4 lg:text-mc-7 font-bold">Bingo Tracker</h1>
          <h2 className="text-mc-gold text-mc-2 lg:text-mc-3">12th Anniversary Bingo</h2>
        </div>
        <div className="w-[80%] flex items-stretch flex-col gap-4">
          <Search />
          <div className="w-full h-[2px] bg-black/50 my-2" />
          <Box contentClass="text-center text-mc-3"><MinecraftText>{player.displayName}</MinecraftText></Box>
          <Box contentClass="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
            <CategoryOverview category="Casual" easyCompletion={24} hardComp={25} />
            <CategoryOverview category="PvP" easyCompletion={12} hardComp={0} />
            <CategoryOverview category="Classic" easyCompletion={100} hardComp={12.5} />
          </Box>
          <div className="grid grid-cols-1 lg:grid-cols-[3fr_2px_2fr] items-center gap-4">
            <CategoryTabs category={category} setCategory={setCategory} />
            <div className="h-[32px] bg-white/20 hidden lg:block" />
            <DifficultyTabs difficulty={difficulty} setDifficulty={setDifficulty} />
          </div>
          <div className="w-full h-[2px] bg-black/50" />
        </div>
        <div className="flex flex-col justify-evenly w-full">
          <BingoBoard player={player} category={category} difficulty={difficulty} />
        </div>
      </div>
    </div>
  );
}

function CategoryOverview({ category, easyCompletion: easyCompletion, hardComp }: { category: string; easyCompletion: number; hardComp: number }) {
  return (
    <div className="flex flex-col justify-center gap-1 lg:gap-4 text-center text-mc-1.5 lg:text-mc-2">
      <div className="flex gap-2 justify-center">
        <Image
          src={SkyWarsIcon}
          width={32}
          height={32}
          alt="icon"
          style={{ imageRendering: "pixelated" }}
          className="opacity-80 group-aria-pressed:opacity-100 transition-opacity w-[24px] lg:w-[32px]"
        />
        <p className="flex items-center justify-center gap-2">{category} Bingo Cards</p>
      </div>
      <div className="flex flex-col justify-center gap-1">
        <p className="text-mc-gray">
          <span className="text-mc-green">Easy</span>:{" "}
          <span
            className={
              easyCompletion == 0 ?
                "text-mc-red" :
                (easyCompletion > 0 && easyCompletion < 100 ?
                  "text-mc-yellow" :
                  "text-mc-green font-bold")
            }
          >
            {easyCompletion}%
          </span>{" "}
          completed
        </p>
        <p className="text-mc-gray">
          <span className="text-mc-red">Hard</span>: <span className="text-mc-red">{hardComp}%</span> completed
        </p>
      </div>
    </div>
  );
}

function BingoBoard({ player, category, difficulty }: { player: Player; category: Category; difficulty: Difficulty }) {
  const bingo = boards[difficulty][category];
  const ASDA = player.stats.general.bingo[difficulty][category];

  // HERE

  return (
    <>
      <div className="overflow-x-auto grid grid-cols-[repeat(6,1fr)] grid-rows-6 gap-2 **:text-mc-1.25 md:**:text-mc-1.5 leading-4">
        <RewardCard reward={bingo.diagonalRewards[0]} />
        {bingo.columnRewards.map((reward) => <RewardCard key={reward.name} reward={reward} />)}
        <RewardCard reward={bingo.diagonalRewards[1]} />
        <div className="row-start-2 col-start-2 grid grid-cols-subgrid grid-rows-subgrid row-span-4 col-span-4">
          {bingo.tasks.map((task) => (
            <TaskCard
              key={task.field as string}
              task={task}
              complete={ASDA[task.field] >= task.progress}
            />
          ))}
        </div>
        {bingo.rowRewards.map((reward) => (
          <RewardCard key={reward.name} containerClass="col-start-6" reward={reward} />
        ))}
        <RewardCard containerClass="col-start-6" reward={bingo.blackoutReward} variant="blackout" />
      </div>
    </>
  );
}

function RewardCard({
  containerClass,
  contentClass,
  variant = "regular",
  reward,
  ...props
}: { reward: Reward; variant?: "blackout" | "regular" } & ComponentProps<typeof Box>) {
  return (
    <Box {...props} containerClass={`${containerClass} min-w-50`} contentClass={`flex flex-col gap-2  ${contentClass}`}>
      <p className={cn("font-bold text-mc-pink text-center", variant === "blackout" && "text-mc-dark-purple")}>{reward.name} Reward</p>
      {typeof reward.description === "string" ?
        (
          <p className="">
            <MinecraftText>{reward.description}</MinecraftText>
          </p>
        ) :
        (
          <div className="flex flex-col gap-0.5">
            {reward.description.map((part) => (
              <MinecraftText key={part}>{part}</MinecraftText>
            ))}
          </div>
        )}
    </Box>
  );
}
function TaskCard({ task, complete }: { task: Task; complete: boolean }) {
  return (
    <Box containerClass="min-w-50" contentClass="flex flex-col gap-2 text-center">
      <div className={complete ? "bg-green-200" : "bg-red-200"}>
        <p className="font-bold text-mc-gold text-center">{task.name}</p>
        <p className="text-mc-dark-gray text-center">{task.game} Task</p>
      </div>
      <p>{task.description}</p>
    </Box>
  );
}

function CategoryTabs({
  category,
  setCategory,
}: {
  category: string;
  setCategory: React.Dispatch<React.SetStateAction<"casual" | "pvp" | "classic">>;
}) {
  return (
    <div className="grid grid-cols-3 gap-4 grow items-center justify-center text-center **:text-mc-1.5 **:lg:text-mc-2">
      <button aria-pressed={category === "casual"} className="group" onClick={() => setCategory("casual")}>
        <Box borderRadius={{ bottom: 0 }}>
          <span className="text-mc-white/60 group-aria-pressed:font-bold group-aria-pressed:text-mc-white transition-colors">
            Casual
          </span>
        </Box>
      </button>
      <button aria-pressed={category === "pvp"} className="group" onClick={() => setCategory("pvp")}>
        <Box borderRadius={{ bottom: 0 }}>
          <span className="text-mc-white/60 group-aria-pressed:font-bold group-aria-pressed:text-mc-white transition-colors">
            PvP
          </span>
        </Box>
      </button>
      <button aria-pressed={category === "classic"} className="group" onClick={() => setCategory("classic")}>
        <Box borderRadius={{ bottom: 0 }}>
          <span className="text-mc-white/60 group-aria-pressed:font-bold group-aria-pressed:text-mc-white transition-colors">
            Classic
          </span>
        </Box>
      </button>
    </div>
  );
}

function DifficultyTabs({
  difficulty,
  setDifficulty,
}: {
  difficulty: string;
  setDifficulty: React.Dispatch<React.SetStateAction<"easy" | "hard">>;
}) {
  return (
    <div className="grid grid-cols-2 grow gap-4 items-center justify-center text-center **:text-mc-1.5 **:lg:text-mc-2">
      <button aria-pressed={difficulty === "easy"} className="group" onClick={() => setDifficulty("easy")}>
        <Box borderRadius={{ bottom: 0 }}>
          <span className="text-mc-green/50 group-aria-pressed:font-bold group-aria-pressed:text-mc-green transition-colors">
            Easy
          </span>
        </Box>
      </button>
      <button aria-pressed={difficulty === "hard"} className="group" onClick={() => setDifficulty("hard")}>
        <Box borderRadius={{ bottom: 0 }}>
          <span className="text-mc-red/50 group-aria-pressed:font-bold group-aria-pressed:text-mc-red transition-colors">
            Hard
          </span>
        </Box>
      </button>
    </div>
  );
}

function Search({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "h-16 flex items-center px-4 gap-4 bg-white/30 border-4 border-white/40 backdrop-blur-sm",
        className
      )}
    >
      <SearchIcon className="size-8 text-white drop-shadow-mc-2" />
      <input
        placeholder="Search a player"
        className="text-mc-2 placeholder-mc-darkgray text-white outline-none h-full w-full selection:bg-white/50"
        spellCheck={false}
      />
    </div>
  );
}
