import { convertMeasurementToValue } from './convert';
import type {
  ElementNode,
  ElementNodeBiDirectional,
  Instruction,
  InstructionBiDirectional,
} from './types';

export const parseMeasurements = (
  bidirectional: ElementNodeBiDirectional,
  size: number,
  shrink = true
) => {
  if (typeof bidirectional.size === 'string') {
    bidirectional.size = size * convertMeasurementToValue(bidirectional.size);
    bidirectional.size -= bidirectional.margin1 + bidirectional.margin2;
  }

  if (typeof bidirectional.size === 'number' && shrink && bidirectional.size > size) {
    bidirectional.size = size;
  }

  return bidirectional;
};

export const innerSize = (bidirectional: ElementNodeBiDirectional, size: number) => {
  return (
    ((bidirectional?.size as number) ?? size) - (bidirectional.padding1 + bidirectional.padding2)
  );
};

export const computeMinSize = (
  node: ElementNode,
  side: 'x' | 'y',
  children: Instruction[],
  useDefinedWidth = true
) => {
  const bidirectional = node[side];

  if (useDefinedWidth && typeof bidirectional.size === 'number') return bidirectional.size;

  switch (bidirectional.direction) {
    case 'row':
      return children.reduce((acc, child) => acc + getTotalSize(child[side]), 0);
    case 'column':
      return Math.max(...children.map((child) => getTotalSize(child[side])));
  }
};

export const getTotalSize = (bidirectional: InstructionBiDirectional) =>
  bidirectional.size +
  bidirectional.padding1 +
  bidirectional.padding2 +
  bidirectional.margin1 +
  bidirectional.margin2;

export const getPositionalDelta = (instruction: Instruction, side: 'x' | 'y'): number => {
  const childrenSize = computeMinSize(
    instruction,
    side,
    instruction.children as Instruction[],
    false
  );

  switch (instruction.style.location) {
    case 'start':
      return instruction[side].padding1;
    case 'center':
      return (instruction[side].size - childrenSize) / 2;
    case 'end':
      throw new Error('end location is not implemented');
  }
};
