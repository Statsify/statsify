"use client";

import { useState } from "react";
import { SearchIcon } from "~/components/icons/search";
import { cn } from "~/lib/util";
import { AnimatePresence, motion } from "motion/react";

export function Search({ className }: { className?: string }) {
  const [players, setPlayers] = useState<string[]>(["Amony", "j4cobi"]);

  const addPlayer = () => {
    const newPlayer = `Player ${players.length + 1}`;
    setPlayers([...players, newPlayer]);
  };

  const removePlayer = () => {
    if (players.length > 0) {
      setPlayers(players.slice(0, -1));
    }
  };

  return (
    <div className="relative">
      <div>
        <button onClick={addPlayer} className="w-8 h-8 bg-green-500 text-white rounded" />
        <button onClick={removePlayer} className="w-8 h-8 bg-red-500 text-white rounded" />
      </div>
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
      <SearchAutocomplete players={players} />
    </div>
  );
}

export function SearchAutocomplete({ players }: { players: string[] }) {
  return (
    <div className="absolute w-full max-h-[300px] overflow-auto">
      <AnimatePresence>
        {players.length ? (
          players.map((player, index) => (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              key={index}
              className="w-full flex flex-col items-center p-2 gap-4 bg-white/25"
            >
              <SearchPlayer player={player} />
            </motion.div>
          ))
        ) : (
          <></>
        )}
      </AnimatePresence>
    </div>
  );
}

function SearchPlayer({ player }: { player: string }) {
  return (
    <div className="flex items-center gap-4 w-full p-2 hover:bg-white/20 active:bg-white/10 cursor-pointer">
      <div className="w-8 h-8 bg-red-300 drop-shadow-mc-2" />
      <p className="text-mc-2 text-white selection:bg-white/50" spellCheck={false}>
        {player}
      </p>
    </div>
  );
}
