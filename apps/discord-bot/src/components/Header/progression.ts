import type { Progression } from '@statsify/schemas';

const xpBar = (percentage: number): string => {
  return `§r§8[§b${'■'.repeat(percentage)}§7${'■'.repeat(10 - percentage)}§8]`;
};

export const formatProgression = (
  progression: Progression,
  currentLevel: string,
  nextLevel: string
) =>
  `§7Progress: §b${progression.current}§7/§a${progression.max}\n${currentLevel} ${xpBar(
    progression.percent
  )} ${nextLevel}`;
