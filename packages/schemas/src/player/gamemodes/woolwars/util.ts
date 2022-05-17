import { findScore } from '@statsify/util';

export const getExpReq = (level: number) => {
  const progress = level % 100;
  if (progress > 4) return 5000;

  const levels = [0, 1000, 2000, 3000, 4000];

  return levels[progress];
};

export const getLevel = (exp = 0): number => {
  const prestiges = Math.floor(exp / 487000);
  let level = prestiges * 100;
  let remainingExp = exp - prestiges * 487000;

  for (let i = 0; i < 5; ++i) {
    const expForNextLevel = getExpReq(i);
    if (remainingExp < expForNextLevel) break;
    level++;
    remainingExp -= expForNextLevel;
  }

  return parseFloat((level + remainingExp / getExpReq(level + 1)).toFixed(2));
};

const applyFormat = ({ format }: { format: string[] }, n: number) => {
  if (format.length == 2) {
    return `${format[0]}${n}${format[1]}`;
  }

  const nums = n
    .toString()
    .split('')
    .map((v, i) => (v = `${format[i] ?? ''}${v}`))
    .join();

  return `${nums}${format[format.length - 1]}`;
};

export const getFormattedLevel = (star: number): string => {
  star = Math.floor(star);

  const prestigeColors: { req: number; format: string[] }[] = [{ req: 0, format: ['§7[', '✫]'] }];

  return applyFormat(findScore(prestigeColors, star), star);
};
