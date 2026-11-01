/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { BOX_GAP, Box, CELL, HEADING_BOX } from "~/components/ui/box";
import { type Category, type Difficulty, type Reward, type Task, boards } from "./boards";
import { Divider } from "~/components/ui/divider";
import { MinecraftText } from "~/components/ui/minecraft-text";
import { SkinHead } from "~/components/ui/skin";
import { Tab, Tabs } from "~/components/ui/tabs";
import { cn } from "~/lib/util";
import { getRouteApi } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import type { BingoPlayer } from "@statsify/contract";
import type { ComponentProps, ReactNode } from "react";

type TaskInfo = Pick<Task, "game" | "name" | "description" | "progress">;

const CATEGORY_ICONS: Record<Category, string> = {
  casual: "/icons/slime-ball.png",
  pvp: "/icons/ender-eye.png",
  classic: "/icons/snowball.png",
};

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

/** A player's boards; `refresh` (the refresh bar) goes in the nametag, under the name. */
export function Bingo({ player, refresh }: { player: BingoPlayer; refresh?: ReactNode }) {
  const { t } = useTranslation();
  const { category, difficulty, select } = useBoardState();

  return (
    <>
      <div className="w-full lg:w-[80%] flex items-stretch flex-col gap-4">
        {/* The nametag over each category's heading and counts, every one its own box, as the bot's cards draw them. */}
        <div className={cn("flex flex-col", BOX_GAP)}>
          <Box className="content:flex content:flex-col content:items-center content:gap-1">
            <div className="flex items-center justify-center gap-4 text-center text-mc-3">
              <SkinHead uuid={player.uuid} className="drop-shadow-mc-4 text-mc-black " />
              <MinecraftText>{player.displayName}</MinecraftText>
            </div>
            {refresh !== undefined && <div className="flex flex-wrap items-center justify-center gap-x-4">{refresh}</div>}
          </Box>
          <div className={cn("grid grid-cols-1 lg:grid-cols-3", BOX_GAP)}>
            <CategoryOverview player={player} category="casual" />
            <CategoryOverview player={player} category="pvp" />
            <CategoryOverview player={player} category="classic" />
          </div>
        </div>
        <Divider variant="black" />
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_2px_2fr] items-center gap-4 **:text-mc-1.5 **:lg:text-mc-2">
          <Tabs tab={category} onTabChange={(category) => select({ category })}>
            <Tab tab="casual">{t("bingo.categories.casual")}</Tab>
            <Tab tab="pvp">{t("bingo.categories.pvp")}</Tab>
            <Tab tab="classic">{t("bingo.categories.classic")}</Tab>
          </Tabs>
          <Divider orientation="vertical" className="h-[32px] hidden lg:block opacity-15" />
          <Tabs tab={difficulty} onTabChange={(difficulty) => select({ difficulty })}>
            <Tab tab="easy" className="text-mc-green/50 aria-pressed:text-mc-green">
              {t("bingo.easy")}
            </Tab>
            {/* Brighter than Easy's while unpressed: red at half strength doesn't reach 3:1 on the box. */}
            <Tab tab="hard" className="text-mc-red/80 aria-pressed:text-mc-red">
              {t("bingo.hard")}
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
  const { t } = useTranslation();

  const easyBingo = player.bingo.easy[category];
  const hardBingo = player.bingo.hard[category];

  const easyCompletion = boards.easy[category].tasks.filter((task) => easyBingo[task.field] >= task.progress).length;
  const hardCompletion = boards.hard[category].tasks.filter((task) => hardBingo[task.field] >= task.progress).length;

  return (
    <div className={cn("flex flex-col text-center text-mc-1.5 lg:text-mc-2", BOX_GAP)}>
      <Box className={cn(HEADING_BOX, "content:gap-2")}>
        {/* At 2× its 16 px art at every width, so no pixel is split, and 1 px up: level with the capitals, as the
            centred line also counts the tails under "g" and "y". */}
        <img
          src={CATEGORY_ICONS[category]}
          width={32}
          height={32}
          alt=""
          style={{ imageRendering: "pixelated" }}
          className="relative -top-px size-8"
        />
        <p className="font-bold text-mc-yellow">{t("bingo.cards", { category: t(`bingo.categories.${category}`) })}</p>
      </Box>
      <CountBox board={{ category, difficulty: "easy" }}>
        <span className="text-mc-green">{t("bingo.easy")}</span>:{" "}
        <span className={completetionColor(easyCompletion)}>{easyCompletion}</span>
        <span className="text-mc-gray">/16</span> {t("bingo.completed")}
      </CountBox>
      <CountBox board={{ category, difficulty: "hard" }}>
        <span className="text-mc-red">{t("bingo.hard")}</span>:{" "}
        <span className={completetionColor(hardCompletion)}>{hardCompletion}</span>
        <span className="text-mc-gray">/16</span> {t("bingo.completed")}
      </CountBox>
    </div>
  );
}

/** A board's count in its own box, the whole box a link to the board. Its ring sits inside, as the box clips. */
function CountBox({ board, children }: { board: { category: Category; difficulty: Difficulty }; children: ReactNode }) {
  return (
    <Box className={cn(CELL, "content:p-0")}>
      <route.Link
        search={(previous) => ({ ...previous, ...board })}
        replace
        resetScroll={false}
        className="flex min-h-11 w-full items-center justify-center px-3 py-1 text-mc-gray hover:bg-white/10 focus-visible:focus-ring-inset"
      >
        <span>{children}</span>
      </route.Link>
    </Box>
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

  const rowCompletion = board.rowRewards.map((_, row) => isRowComplete(row));
  const columnCompletion = board.columnRewards.map((_, column) => isColumnComplete(column));
  const diagonalCompletion = [isDiagonalComplete(0), isDiagonalComplete(1)];
  const blackout = board.tasks.every((task) => bingo[task.field] >= task.progress);
  const keyPrefix = `${difficulty}-${category}`;

  return (
    <>
      {/* Below `xl` the 6×6 board doesn't fit, so the 16 tasks are a list (two columns on tablets) followed by the
          rewards, instead of a grid scrolling sideways. Text is 24 px. */}
      <ol className={cn("grid grid-cols-1 md:grid-cols-2 xl:hidden **:text-mc-1.5", BOX_GAP)}>
        {board.tasks.map((task) => (
          <li key={`${keyPrefix}-${String(task.field)}`} className="grid">
            <TaskCard task={task} finished={bingo[task.field]} complete={bingo[task.field] >= task.progress} />
          </li>
        ))}
        {[
          ...board.rowRewards.map((reward, row) => [reward, rowCompletion[row]] as const),
          ...board.columnRewards.map((reward, column) => [reward, columnCompletion[column]] as const),
          ...board.diagonalRewards.map((reward, diagonal) => [reward, diagonalCompletion[diagonal]] as const),
        ].map(([reward, completed]) => (
          <li key={`${keyPrefix}-${reward.name}`} className="grid">
            <RewardCard reward={reward} completed={completed} />
          </li>
        ))}
        <li className="grid">
          <RewardCard reward={board.blackoutReward} variant="blackout" completed={blackout} />
        </li>
      </ol>
      <div className={cn("hidden xl:grid grid-cols-[repeat(6,minmax(0,1fr))] grid-rows-6 **:text-mc-1.5", BOX_GAP)}>
        <RewardCard key={`${keyPrefix}-diagonal-0`} reward={board.diagonalRewards[0]} completed={diagonalCompletion[0]} />
        {board.columnRewards.map((reward, column) => (
          <RewardCard key={`${keyPrefix}-${reward.name}`} reward={reward} completed={columnCompletion[column]} />
        ))}
        <RewardCard key={`${keyPrefix}-diagonal-1`} reward={board.diagonalRewards[1]} completed={diagonalCompletion[1]} />
        <div className="row-start-2 col-start-2 grid grid-cols-subgrid grid-rows-subgrid row-span-4 col-span-4">
          {board.tasks.map((task) => (
            <TaskCard
              key={`${keyPrefix}-${String(task.field)}`}
              task={task}
              finished={bingo[task.field]}
              complete={bingo[task.field] >= task.progress}
            />
          ))}
        </div>
        {board.rowRewards.map((reward, row) => (
          <RewardCard key={`${keyPrefix}-${reward.name}`} className="col-start-6" reward={reward} completed={rowCompletion[row]} />
        ))}
        <RewardCard key={`${keyPrefix}-blackout`} className="col-start-6" reward={board.blackoutReward} variant="blackout" completed={blackout} />
      </div>
    </>
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
  const { t } = useTranslation();

  return (
    <Box
      {...props}
      className={`min-w-0 grow content:flex content:flex-col content:gap-2 ${className}`}
      variant={completed ? "pink" : "default"}
    >
      <p className={cn("font-bold text-mc-pink text-center", variant === "blackout" && "text-mc-dark-purple")}>
        {t("bingo.reward", { name: reward.name })}
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
  const { t } = useTranslation();

  return (
    <Box
      className="grow min-w-0 content:flex content:flex-col content:justify-between content:gap-2 content:text-center"
      variant={complete ? "green" : "red"}
    >
      <div className="flex flex-col gap-2">
        <div className={complete ? "first:text-mc-green" : "first:text-mc-red"}>
          <p className="font-bold text-center">{task.name}</p>
          <p className="text-mc-gray text-center">{t("bingo.task", { game: task.game })}</p>
        </div>
        <p>{task.description}</p>
      </div>
      <p className="text-mc-gray">
        {t("bingo.progress")}{" "}
        <span className={complete ? "text-mc-green" : (finished > 0 ? "text-mc-yellow" : "text-mc-red")}>{finished}</span>
        <span className={complete ? "text-mc-green" : "text-mc-gray"}>/</span>
        <span className={complete ? "text-mc-green" : "text-mc-gray"}>{task.progress}</span>
      </p>
    </Box>
  );
}
