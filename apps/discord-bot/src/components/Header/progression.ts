import { LocalizeFunction } from '@statsify/discord';
import type { Progression } from '@statsify/schemas';

const xpBar = (percentage: number): string => {
  const max = 10;
  const count = Math.ceil(max * percentage);

  return `§r§8[§b${'■'.repeat(count)}§7${'■'.repeat(max - count)}§8]`;
};

export const formatProgression = (
  t: LocalizeFunction,
  progression: Progression,
  currentLevel: string,
  nextLevel: string
) =>
  progression.max
    ? `§7Progress: §b${t(progression.current)}§7/§a${t(progression.max)}\n${currentLevel} ${xpBar(
        progression.percent
      )} ${nextLevel}`
    : `§b§lMAXED`;
