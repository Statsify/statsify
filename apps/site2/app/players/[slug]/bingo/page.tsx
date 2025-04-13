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
import { AnimatePresence, motion } from "motion/react";
import { Background } from "~/components/ui/background";
import { Box } from "~/components/ui/box";
import { type Category, type Difficulty, type Reward, type Task, boards } from "./boards";
import { ComponentProps, createContext, use, useState } from "react";
import { Divider } from "~/components/ui/divider";
import { MinecraftText } from "~/components/ui/minecraft-text";
import { Search } from "~/app/players/search";
import { Tab, Tabs } from "~/components/ui/tabs";
import { cn } from "~/lib/util";
import { usePlayer } from "~/app/players/[slug]/context";

const closestTileToCategory: Record<Category, [number, number]> = {
  casual: [0.5, 0],
  pvp: [1.5, 0],
  classic: [2.5, 0],
};

const closestTileToDifficulty: Record<Difficulty, [number, number]> = {
  easy: [3.5, 0],
  hard: [4.5, 0],
};

const BingoContext = createContext<{ animationSource: [number, number] }>({ animationSource: [0, 0] });

export default function BingoPage() {
  const [category, setCategory] = useState<Category>("casual");
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [animationSource, setAnimationSource] = useState<[number, number]>([0, 0]);
  const player = usePlayer();

  return (
    <div className="h-full">
      <Background
        background="bingo"
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
          <Divider variant="black" className="my-2" />
          <Box contentClass="text-center text-mc-3">
            <MinecraftText>{player.displayName}</MinecraftText>
          </Box>
          <Box contentClass="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
            <CategoryOverview category="Casual" easyCompletion={24} hardCompletion={25} />
            <CategoryOverview category="PvP" easyCompletion={12} hardCompletion={0} />
            <CategoryOverview category="Classic" easyCompletion={100} hardCompletion={12.5} />
          </Box>
          <div className="grid grid-cols-1 lg:grid-cols-[3fr_2px_2fr] items-center gap-4 **:text-mc-1.5 **:lg:text-mc-2">
            <Tabs
              tab={category}
              onTabChange={(category) => {
                setCategory(category);
                setAnimationSource(closestTileToCategory[category]);
              }}
            >
              <Tab tab="casual">Casual</Tab>
              <Tab tab="pvp">PvP</Tab>
              <Tab tab="classic">Classic</Tab>
            </Tabs>
            <Divider orientation="vertical" className="h-[32px] hidden lg:block opacity-15" />
            <Tabs
              tab={difficulty}
              onTabChange={(difficulty) => {
                setDifficulty(difficulty);
                setAnimationSource(closestTileToDifficulty[difficulty]);
              }}
            >
              <Tab tab="easy" containerClass="text-mc-green/50 aria-pressed:text-mc-green">
                Easy
              </Tab>
              <Tab tab="hard" containerClass="text-mc-red/50 aria-pressed:text-mc-red">
                Hard
              </Tab>
            </Tabs>
          </div>
          <Divider variant="black" />
        </div>
        <div className="flex flex-col justify-evenly w-full">
          <BingoContext.Provider value={{ animationSource }}>
            <BingoBoard category={category} difficulty={difficulty} />
          </BingoContext.Provider>
        </div>
      </div>
    </div>
  );
}

function CategoryOverview({
  category,
  easyCompletion,
  hardCompletion,
}: {
  category: string;
  easyCompletion: number;
  hardCompletion: number;
}) {
  return (
    <div className="flex flex-col justify-center gap-1 lg:gap-4 text-center text-mc-1.5 lg:text-mc-2">
      <div className="flex gap-2 items-center justify-center">
        <Image
          src={SkyWarsIcon}
          width={32}
          height={32}
          alt="icon"
          style={{ imageRendering: "pixelated" }}
        />
        <p>{category} Bingo Cards</p>
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
          <span className="text-mc-red">Hard</span>: <span className="text-mc-red">{hardCompletion}%</span> completed
        </p>
      </div>
    </div>
  );
}

function BingoBoard({ category, difficulty }: { category: Category; difficulty: Difficulty }) {
  const bingo = boards[difficulty][category];
  const player = usePlayer();
  const ASDA = player.stats.general.bingo[difficulty][category];

  // HERE
  return (
    <div className="overflow-x-auto grid grid-cols-[repeat(6,1fr)] grid-rows-6 gap-2 **:text-mc-1.25 md:**:text-mc-1.5 leading-4">
      <AnimatePresence mode="popLayout" initial={false}>
        <RewardCard key={`${difficulty}-${category}-diagonal-0`} reward={bingo.diagonalRewards[0]} location={[0, 0]} />
        {bingo.columnRewards.map((reward, index) => (
          <RewardCard key={`${difficulty}-${category}-${reward.name}`} reward={reward} location={[1 + index, 0]} />
        ))}
        <RewardCard
          key={`${difficulty}-${category}-diagonal-1`}
          reward={bingo.diagonalRewards[1]}
          location={[1 + bingo.columnRewards.length, 0]}
        />
        <div className="row-start-2 col-start-2 grid grid-cols-subgrid grid-rows-subgrid row-span-4 col-span-4">
          {bingo.tasks.map((task, index) => (
            <TaskCard
              key={`${difficulty}-${category}-${task.field}`}
              task={task}
              finished={ASDA[task.field]}
              complete={ASDA[task.field] >= task.progress}
              location={[1 + (index % 4), 1 + Math.floor(index / 4)]}
            />
          ))}
        </div>
        {bingo.rowRewards.map((reward, index) => (
          <RewardCard
            key={`${difficulty}-${category}-${reward.name}`}
            containerClass="col-start-6"
            reward={reward}
            location={[1 + bingo.columnRewards.length, 1 + index]}
          />
        ))}
        <RewardCard
          key={`${difficulty}-${category}-blackout`}
          containerClass="col-start-6"
          reward={bingo.blackoutReward}
          variant="blackout"
          location={[1 + bingo.columnRewards.length, 1 + bingo.rowRewards.length]}
        />
      </AnimatePresence>
    </div>
  );
}

const DELAY_DISTANCE_SCALE = 40;
const DURATION = 0.17;

function RewardCard({
  containerClass,
  contentClass,
  variant = "regular",
  location: [x, y],
  reward,
  ...props
}: { reward: Reward; location: [number, number]; variant?: "blackout" | "regular" } & Omit<
  ComponentProps<typeof Box>,
  "variant"
>) {
  const { animationSource } = use(BingoContext);
  const distance = Math.sqrt(Math.pow(x - animationSource[0], 2) + Math.pow(y - animationSource[1], 2));

  return (
    <motion.div
      className={`${containerClass} min-w-50 flex`}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0 }}
      transition={{ delay: distance / DELAY_DISTANCE_SCALE, type: "spring", duration: DURATION, bounce: 0.2 }}
    >
      <Box {...props} containerClass="grow" contentClass={`flex flex-col gap-2  ${contentClass}`}>
        <p className={cn("font-bold text-mc-pink text-center", variant === "blackout" && "text-mc-dark-purple")}>
          {reward.name} Reward
        </p>
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
    </motion.div>
  );
}

function TaskCard({
  task,
  location: [x, y],
  finished,
  complete,
}: {
  task: Task;
  location: [number, number];
  finished: number;
  complete: boolean;
}) {
  const { animationSource } = use(BingoContext);
  const distance = Math.sqrt(Math.pow(x - animationSource[0], 2) + Math.pow(y - animationSource[1], 2));

  return (
    <motion.div
      className="min-w-50 flex"
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0 }}
      transition={{ delay: distance / DELAY_DISTANCE_SCALE, type: "spring", duration: DURATION, bounce: 0.2 }}
    >
      <Box
        containerClass="grow"
        contentClass="flex flex-col justify-between gap-2 text-center"
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
    </motion.div>
  );
}

