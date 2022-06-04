import type {
  ElementNodeBiDirectional,
  Fraction,
  Instruction,
  InstructionBiDirectional,
  Percent,
} from './types';

export const toDecimal = (measurement: Percent | Fraction): number => {
  if (measurement.endsWith('%')) return parseFloat(measurement.replace('%', '')) / 100;

  const [num, denom] = measurement.split('/').map((v) => parseInt(v, 10));
  return num / denom;
};

export const innerSize = (bidirectional: ElementNodeBiDirectional, size: number) =>
  ((bidirectional.size as number) ?? size) - (bidirectional.padding1 + bidirectional.padding2);

const getMargin = (bidirectional: InstructionBiDirectional | ElementNodeBiDirectional) =>
  bidirectional.margin1 + bidirectional.margin2;

const getPadding = (bidirectional: InstructionBiDirectional | ElementNodeBiDirectional) =>
  bidirectional.padding1 + bidirectional.padding2;

interface GetTotalSizeOptions {
  margin?: boolean;
  padding?: boolean;
  size?: boolean;
}

export const getTotalSize = (
  bidirectional: InstructionBiDirectional | ElementNodeBiDirectional,
  { margin = true, padding = true, size = true }: GetTotalSizeOptions = {}
) => {
  let s = 0;

  if (size) {
    if (typeof bidirectional.size === 'number') s += bidirectional.size;
    else s += bidirectional.minSize;
  }
  if (margin) s += getMargin(bidirectional);
  if (padding) s += getPadding(bidirectional);

  return s;
};

const getChildrenSize = (
  instruction: Instruction,
  side: 'x' | 'y',
  { margin = true, padding = true, size = true }: GetTotalSizeOptions = {}
) => {
  const bidirectional = instruction[side];

  let min = 0;

  switch (bidirectional.direction) {
    case 'row':
      min = instruction.children!.reduce((acc, child) => acc + getTotalSize(child[side]), 0);
      break;
    case 'column':
      min = Math.max(...instruction.children!.map((child) => getTotalSize(child[side])));
      break;
  }

  return getTotalSize({ ...bidirectional, size: min }, { margin, padding, size });
};

export const getPositionalDelta = (instruction: Instruction, side: 'x' | 'y'): number => {
  switch (instruction.style.location) {
    case 'left':
      return instruction[side].padding1;
    case 'center': {
      const childrenSize = getChildrenSize(instruction, side, {
        margin: false,
        padding: false,
      });

      return (instruction[side].size - childrenSize) / 2;
    }
    case 'right':
      throw new Error('right location is not implemented');
  }
};
