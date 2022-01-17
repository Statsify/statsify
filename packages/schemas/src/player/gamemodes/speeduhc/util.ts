import { findScoreIndex } from '@statsify/util';

export const titleScores = [
  { req: 0, title: 'Hiker' },
  { req: 50, title: 'Jogger' },
  { req: 300, title: 'Runner' },
  { req: 1050, title: 'Sprinter' },
  { req: 2550, title: 'Turbo' },
  { req: 5550, title: 'Sanic' },
  { req: 15550, title: 'Hot Rod' },
  { req: 30550, title: 'Bolt' },
  { req: 55550, title: 'Zoom' },
  { req: 85550, title: 'God Speed' },
];

export const getLevelIndex = (score: number): number => findScoreIndex(titleScores, score);
