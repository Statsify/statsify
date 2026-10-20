/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Box } from "~/components/ui/box";
import { CATEGORY_ICONS, FormattedCategories } from "./board-search";
import { type Category, type Difficulty, type Reward, type Task, boards } from "./boards";
import { Divider } from "~/components/ui/divider";
import { MinecraftText } from "~/components/ui/minecraft-text";
import { SkinHead } from "~/components/ui/skin";
import { Tab, Tabs } from "~/components/ui/tabs";
import { cn } from "~/lib/util";
import { getRouteApi } from "@tanstack/react-router";
import type { BingoPlayer } from "@statsify/contract";
import type { ComponentProps } from "react";

type TaskInfo = Pick<Task, "game" | "name" | "description" | "progress">;

const route = getRouteApi("/{-$locale}/player/$name/bingo");

/** The selected board, kept in the URL so links to a board can be shared. */
function useBoardState() {
  const search = route.useSearch();
  const navigate = route.useNavigate();
  const category = search.category ?? "casual";
  const difficulty = search.difficulty ?? "easy";

  const select = (next: { category?: Category; difficulty?: Difficulty }) =>
    void navigate({ search: (previous) => ({ ...previous, ...next }), replace: true, resetScroll: false });

  return { category, difficulty, select };
}

export function Bingo({ player }: { player: BingoPlayer }) {
  const { category, difficulty, select } = useBoardState();

  return (
    <>
      <div className="w-[80%] flex items-stretch flex-col gap-4">
        <Box className="content:text-center content:text-mc-3 content:flex content:items-center content:justify-center content:gap-4">
          <SkinHead uuid={player.uuid} className="drop-shadow-mc-4 text-mc-black " />
          <MinecraftText>{player.displayName}</MinecraftText>
        </Box>
        <Box className="content:grid content:grid-cols-1 content:lg:grid-cols-3 content:gap-4 content:lg:gap-8">
          <CategoryOverview player={player} category="casual" />
          <CategoryOverview player={player} category="pvp" />
          <CategoryOverview player={player} category="classic" />
        </Box>
        <Divider variant="black" />
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_2px_2fr] items-center gap-4 **:text-mc-1.5 **:lg:text-mc-2">
          <Tabs tab={category} onTabChange={(category) => select({ category })}>
            <Tab tab="casual">Casual</Tab>
            <Tab tab="pvp">PvP</Tab>
            <Tab tab="classic">Classic</Tab>
          </Tabs>
          <Divider orientation="vertical" className="h-[32px] hidden lg:block opacity-15" />
          <Tabs tab={difficulty} onTabChange={(difficulty) => select({ difficulty })}>
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
        <BingoBoard player={player} category={category} difficulty={difficulty} />
      </div>
    </>
  );
}

function completetionColor(completion: number) {
  if (completion === 0) return "text-mc-red";
  if (completion === 16) return "text-mc-green font-bold";
  return "text-mc-yellow";
}

function CategoryOverview({ player, category }: { player: BingoPlayer; category: Category }) {
  const { select } = useBoardState();

  const easyBingo = player.bingo.easy[category];
  const hardBingo = player.bingo.hard[category];

  const easyCompletion = boards.easy[category].tasks.filter((task) => easyBingo[task.field] >= task.progress).length;
  const hardCompletion = boards.hard[category].tasks.filter((task) => hardBingo[task.field] >= task.progress).length;

  return (
    <div className="flex flex-col justify-center gap-1 lg:gap-3 text-center text-mc-1.5 lg:text-mc-2">
      <div className="flex gap-2 items-center justify-center">
        <img
          src={CATEGORY_ICONS[category]}
          width={32}
          height={32}
          alt=""
          style={{ imageRendering: "pixelated" }}
          className="w-6 h-6 lg:w-8 lg:h-8"
        />
        <p className="font-bold text-mc-yellow">{FormattedCategories[category]} Bingo Cards</p>
      </div>
      <div className="flex flex-col justify-center items-center gap-1">
        <button
          type="button"
          className="text-mc-gray cursor-pointer w-fit"
          onClick={() => select({ category, difficulty: "easy" })}
        >
          <span className="text-mc-green">Easy</span>:{" "}
          <span className={completetionColor(easyCompletion)}>{easyCompletion}</span>
          <span className="text-mc-gray">/16</span> completed
        </button>
        <button
          type="button"
          className="text-mc-gray cursor-pointer w-fit"
          onClick={() => select({ category, difficulty: "hard" })}
        >
          <span className="text-mc-red">Hard</span>:{" "}
          <span className={completetionColor(hardCompletion)}>{hardCompletion}</span>
          <span className="text-mc-gray">/16</span> completed
        </button>
      </div>
    </div>
  );
}

function BingoBoard({
  player,
  category,
  difficulty,
}: {
  player: BingoPlayer;
  category: Category;
  difficulty: Difficulty;
}) {
  const board = boards[difficulty][category];
  const bingo = player.bingo[difficulty][category];

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
            key={`${difficulty}-${category}-${String(task.field)}`}
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

function TaskCard({ task, finished, complete }: { task: TaskInfo; finished: number; complete: boolean }) {
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
        <span className={complete ? "text-mc-green" : (finished > 0 ? "text-mc-yellow" : "text-mc-red")}>{finished}</span>
        <span className={complete ? "text-mc-green" : "text-mc-gray"}>/</span>
        <span className={complete ? "text-mc-green" : "text-mc-gray"}>{task.progress}</span>
      </p>
    </Box>
  );
}
