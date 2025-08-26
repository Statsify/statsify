/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

"use client";

import CasualIcon from "~/public/icons/slime-ball.png";
import ClassicIcon from "~/public/icons/snowball.png";
import Image from "next/image";
import PvPIcon from "~/public/icons/ender-eye.png";
import { Box } from "~/components/ui/box";
import { type Category, type Difficulty, type Reward, type Task, boards } from "./boards";
import { ComponentProps } from "react";
import { Divider } from "~/components/ui/divider";
import { MinecraftText } from "~/components/ui/minecraft-text";
import { PlayerProvider, usePlayer } from "~/app/players/[slug]/context";
import { SkinHead } from "~/components/ui/skin";
import { Tab, Tabs } from "~/components/ui/tabs";
import { cn } from "~/lib/util";
import { useUrlState } from "~/hooks/use-url-state";
import { z } from "zod";
import type { Player } from "@statsify/schemas";
import type { StaticImport } from "next/dist/shared/lib/get-img-props";

export const FormattedCategories: Record<Category, string> = {
  casual: "Casual",
  classic: "Classic",
  pvp: "PvP",
};

const CategorySchema = z.enum(["casual", "pvp", "classic"]);
const DifficultySchema = z.enum(["easy", "hard"]);

export function Bingo({ player }: { player: Player }) {
  const [category, setCategory] = useUrlState<Category>("category", CategorySchema, "casual");
  const [difficulty, setDifficulty] = useUrlState<Difficulty>("difficulty", DifficultySchema, "easy");

  return (
    <PlayerProvider player={player}>
      <div className="w-[80%] flex items-stretch flex-col gap-4">
        <Box className="content:text-center content:text-mc-3 content:flex content:items-center content:justify-center content:gap-4">
          <SkinHead uuid={player.uuid} className="drop-shadow-mc-4 text-mc-black " />
          <MinecraftText>{player.displayName}</MinecraftText>
        </Box>
        <Box className="content:grid content:grid-cols-1 content:lg:grid-cols-3 content:gap-4 content:lg:gap-8">
          <CategoryOverview icon={CasualIcon} category="casual" />
          <CategoryOverview icon={PvPIcon} category="pvp" />
          <CategoryOverview icon={ClassicIcon} category="classic" />
        </Box>
        <Divider variant="black" />
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_2px_2fr] items-center gap-4 **:text-mc-1.5 **:lg:text-mc-2">
          <Tabs tab={category} onTabChange={setCategory}>
            <Tab tab="casual">Casual</Tab>
            <Tab tab="pvp">PvP</Tab>
            <Tab tab="classic">Classic</Tab>
          </Tabs>
          <Divider orientation="vertical" className="h-[32px] hidden lg:block opacity-15" />
          <Tabs tab={difficulty} onTabChange={setDifficulty}>
            <Tab tab="easy" className="text-mc-green/50 aria-pressed:text-mc-green">
              Easy
            </Tab>
            <Tab tab="hard" className="text-mc-red/50 aria-pressed:text-mc-red">
              Hard
            </Tab>
          </Tabs>
        </div>
      </div>
      <div className="flex flex-col justify-evenly w-full">
        <BingoBoard category={category} difficulty={difficulty} />
      </div>
    </PlayerProvider>
  );
}

function completetionColor(completion: number) {
  if (completion === 0) return "text-mc-red";
  if (completion === 16) return "text-mc-green font-bold";
  return "text-mc-yellow";
}

function CategoryOverview({ category, icon }: { category: Category; icon: StaticImport }) {
  const player = usePlayer();
  const [_, setCategory] = useUrlState<Category>("category", CategorySchema, "casual");
  const [__, setDifficulty] = useUrlState<Difficulty>("difficulty", DifficultySchema, "easy");

  const easyBingo = player.stats.general.bingo.easy[category];
  const hardBingo = player.stats.general.bingo.hard[category];

  const easyCompletion = boards.easy[category].tasks.filter((task) => easyBingo[task.field] >= task.progress).length;
  const hardCompletion = boards.hard[category].tasks.filter((task) => hardBingo[task.field] >= task.progress).length;

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
      <div className="flex flex-col justify-center items-center gap-1">
        <p
          className="text-mc-gray cursor-pointer w-fit"
          onClick={() => {
            setCategory(category);
            setDifficulty("easy");
          }}
        >
          <span className="text-mc-green">Easy</span>:{" "}
          <span className={completetionColor(easyCompletion)}>{easyCompletion}</span>
          <span className="text-mc-gray">/16</span> completed
        </p>
        <p
          className="text-mc-gray cursor-pointer w-fit"
          onClick={() => {
            setCategory(category);
            setDifficulty("hard");
          }}
        >
          <span className="text-mc-red">Hard</span>:{" "}
          <span className={completetionColor(hardCompletion)}>{hardCompletion}</span>
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
  const player = usePlayer();
  const bingo = player.stats.general.bingo[difficulty][category];

  const isLineComplete = (transformation: (index: number, line: number) => number) => (line: number) => {
    for (let i = 0; i < 4; i++) {
      const task = board.tasks[transformation(i, line)];
      if (bingo[task.field] < task.progress) return false;
    }

    return true;
  };

  const isRowComplete = isLineComplete((i, row) => i + row * 4);
  const isColumnComplete = isLineComplete((i, column) => i * 4 + column);
  const isDiagonalComplete = isLineComplete((i, diagonal) => i * 4 + (diagonal === 0 ? i : 3 - i));

  // HERE
  return (
    <div className="overflow-x-auto grid grid-cols-[repeat(6,1fr)] grid-rows-6 gap-2 **:text-mc-1.25 md:**:text-mc-1.5 leading-4">
      <RewardCard
        key={`${difficulty}-${category}-diagonal-0`}
        reward={board.diagonalRewards[0]}
        completed={isDiagonalComplete(0)}
      />
      {board.columnRewards.map((reward, column) => (
        <RewardCard
          key={`${difficulty}-${category}-${reward.name}`}
          reward={reward}
          completed={isColumnComplete(column)}
        />
      ))}
      <RewardCard
        key={`${difficulty}-${category}-diagonal-1`}
        reward={board.diagonalRewards[1]}
        completed={isDiagonalComplete(1)}
      />
      <div className="row-start-2 col-start-2 grid grid-cols-subgrid grid-rows-subgrid row-span-4 col-span-4">
        {board.tasks.map((task) => (
          <TaskCard
            key={`${difficulty}-${category}-${task.field}`}
            task={task}
            finished={bingo[task.field]}
            complete={bingo[task.field] >= task.progress}
          />
        ))}
      </div>
      {board.rowRewards.map((reward, row) => (
        <RewardCard
          key={`${difficulty}-${category}-${reward.name}`}
          className="col-start-6"
          reward={reward}
          completed={isRowComplete(row)}
        />
      ))}
      <RewardCard
        key={`${difficulty}-${category}-blackout`}
        className="col-start-6"
        reward={board.blackoutReward}
        variant="blackout"
        completed={board.tasks.every((task) => bingo[task.field] >= task.progress)}
      />
    </div>
  );
}

function RewardCard({
  className = "",
  variant = "regular",
  completed,
  reward,
  ...props
}: { reward: Reward; variant?: "blackout" | "regular"; completed: boolean } & Omit<
  ComponentProps<typeof Box>,
  "variant"
>) {
  return (
    <Box
      {...props}
      className={`min-w-50 grow content:flex content:flex-col content:gap-2 ${className}`}
      variant={completed ? "pink" : "default"}
    >
      <p className={cn("font-bold text-mc-pink text-center", variant === "blackout" && "text-mc-dark-purple")}>
        {reward.name} Reward
      </p>
      {typeof reward.description === "string" ?
        (
          <MinecraftText>{reward.description}</MinecraftText>
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

function TaskCard({ task, finished, complete }: { task: Task; finished: number; complete: boolean }) {
  return (
    <Box
      className="grow min-w-50 content:flex content:flex-col content:justify-between content:gap-2 content:text-center"
      variant={complete ? "green" : "red"}
    >
      <div className="flex flex-col gap-2">
        <div className={complete ? "first:text-mc-green" : "first:text-mc-red"}>
          <p className="font-bold text-center">{task.name}</p>
          <p className="text-mc-dark-gray text-center">{task.game} Task</p>
        </div>
        <p>{task.description}</p>
      </div>
      <p className="text-mc-gray">
        Progress:{" "}
        <span
          className={`${
            finished > 0 && finished < task.progress ?
              "text-mc-yellow" :
              (finished >= task.progress ?
                "text-mc-green" :
                "text-mc-red")
          }`}
        >
          {finished}
        </span>
        <span className={complete ? "text-mc-green" : "text-mc-gray"}>/</span>
        <span className={complete ? "text-mc-green" : "text-mc-gray"}>{task.progress}</span>
      </p>
    </Box>
  );
}
