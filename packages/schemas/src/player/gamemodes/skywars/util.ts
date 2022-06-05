import { Color } from '../../../color';
export const getLevel = (xp: number): number => {
  const totalXp = [0, 2, 7, 15, 25, 50, 100, 200, 350, 600, 1000, 1500];
  if (xp >= 15000) return Math.floor((xp - 15000) / 10000 + 12);

  const level = totalXp.findIndex((x) => x * 10 - xp > 0);
  return level;
};

export const getLevelProgress = (xp: number): { current: number; total: number } => {
  const totalXp = [0, 2, 7, 15, 25, 50, 100, 200, 350, 600, 1000, 1500];
  const xpToNextLvl = [0, 2, 5, 8, 10, 25, 50, 100, 150, 250, 400, 500]; // * 10
  let currentLevelXp = xp;

  if (xp >= 15000) {
    currentLevelXp -= 15000;
    if (currentLevelXp === 0)
      return {
        current: 0,
        total: 10000,
      };
    if (currentLevelXp > 10000) {
      do {
        currentLevelXp -= 10000;
      } while (currentLevelXp >= 10000);
    }

    return {
      current: currentLevelXp,
      total: 10000,
    };
  }

  const totalXptoNextLevel = xpToNextLvl[totalXp.findIndex((x) => x * 10 - xp > 0)] * 10;

  for (let i = 0; i < xpToNextLvl.length; i++) {
    if (currentLevelXp - xpToNextLvl[i] * 10 < 0) break;
    currentLevelXp -= xpToNextLvl[i] * 10;
  }

  return {
    current: currentLevelXp,
    total: totalXptoNextLevel,
  };
};

export const getFormattedLevel = (level: number, star: string) => {
  level = Math.floor(level);
  const prestigeColors = [
    { req: 0, fn: (n: number, m: string) => `§7[${n}${m}]` },
    { req: 5, fn: (n: number, m: string) => `§f[${n}${m}]` },
    { req: 10, fn: (n: number, m: string) => `§6[${n}${m}]` },
    { req: 15, fn: (n: number, m: string) => `§b[${n}${m}]` },
    { req: 20, fn: (n: number, m: string) => `§2[${n}${m}]` },
    { req: 25, fn: (n: number, m: string) => `§3[${n}${m}]` },
    { req: 30, fn: (n: number, m: string) => `§4[${n}${m}]` },
    { req: 35, fn: (n: number, m: string) => `§d[${n}${m}]` },
    { req: 40, fn: (n: number, m: string) => `§9[${n}${m}]` },
    { req: 45, fn: (n: number, m: string) => `§5[${n}${m}]` },
    {
      req: 50,
      fn: (n: number, m: string) => {
        const nums = n.toString().split('');
        if (m.length > 1) {
          const stars = m.toString().split('');
          return `§c[§6${nums[0]}§e${nums[1]}§b${stars[0]}§a${stars[1]}§d${stars[2]}§5]`;
        } else {
          return `§c[§6${nums[0]}§e${nums[1]}§b${m}§a]`;
        }
      },
    },
    {
      req: 100,
      fn: (n: number, m: string) => {
        const nums = n.toString().split('');
        if (m.length > 1) {
          const stars = m.toString().split('');
          return `§c[§l§6${nums[0]}§e${nums[1]}§a${nums[2]}§b${stars[0]}§d${stars[1]}§5${stars[2]}§r§c]`;
        } else {
          return `§c[§l§6${nums[0]}§e${nums[1]}§a${nums[2]}§b${m}§r§d]`;
        }
      },
    },
  ];

  const index = prestigeColors.findIndex(
    ({ req }, index, arr) =>
      level >= req && ((arr[index + 1] && level < arr[index + 1].req) || !arr[index + 1])
  );
  return prestigeColors[index == -1 ? 0 : index].fn(level, star);
};

export const getPresColor = (star: number): Color => {
  const colors = [
    { level: 0, color: new Color('GRAY') },
    { level: 5, color: new Color('WHITE') },
    { level: 10, color: new Color('GOLD') },
    { level: 15, color: new Color('AQUA') },
    { level: 20, color: new Color('DARK_GREEN') },
    { level: 25, color: new Color('DARK_AQUA') },
    { level: 30, color: new Color('DARK_RED') },
    { level: 35, color: new Color('LIGHT_PURPLE') },
    { level: 40, color: new Color('BLUE') },
    { level: 45, color: new Color('DARK_PURPLE') },
    { level: 50, color: new Color('RED') },
  ];

  const index = colors.findIndex(
    ({ level }, index, arr) =>
      star >= level && ((arr[index + 1] && star < arr[index + 1].level) || !arr[index + 1])
  );

  return colors[index == -1 ? 0 : index].color;
};

export const parseKit = (kit = 'default'): string => {
  return kit
    .substring(kit.lastIndexOf('solo_') !== -1 ? kit.lastIndexOf('solo_') + 5 : 0)
    .substring(kit.lastIndexOf('team_') !== -1 ? kit.lastIndexOf('team_') + 5 : 0);
};
