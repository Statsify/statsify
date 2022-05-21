import { LocalizeFunction } from '@statsify/discord';
import type { Progression } from '@statsify/schemas';

const xpBar = (percentage: number): string => {
  return `§r§8[§b${'■'.repeat(percentage)}§7${'■'.repeat(10 - percentage)}§8]`;
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
