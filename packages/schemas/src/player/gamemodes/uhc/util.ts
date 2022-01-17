import { findScoreIndex } from '@statsify/util';

export const titleScores = [
  { req: 0, title: 'Recruit' },
  { req: 10, title: 'Initiate' },
  { req: 60, title: 'Soldier' },
  { req: 210, title: 'Sergeant' },
  { req: 460, title: 'Knight' },
  { req: 960, title: 'Captain' },
  { req: 1710, title: 'Centurion' },
  { req: 2710, title: 'Gladiator' },
  { req: 5210, title: 'Warlord' },
  { req: 10210, title: 'Champion' },
  { req: 13210, title: 'Champion' },
  { req: 16210, title: 'Champion' },
  { req: 19210, title: 'Champion' },
  { req: 22210, title: 'Champion' },
  { req: 25210, title: 'High Champion' },
];

export const getLevelIndex = (score: number): number => findScoreIndex(titleScores, score);
