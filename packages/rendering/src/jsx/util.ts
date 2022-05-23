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
    if (bidirectional.size === 'remaining')
      throw new Error('A component can only have remaining size if it is a child element');

    bidirectional.size = size * convertMeasurementToValue(bidirectional.size);
    bidirectional.size -= bidirectional.margin1 + bidirectional.margin2;
  }

  if (typeof bidirectional.size === 'number' && shrink && bidirectional.size > size) {
    bidirectional.size = size;
  }

  return bidirectional;
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

  if (size && typeof bidirectional.size === 'number') s += bidirectional.size;
  if (margin) s += getMargin(bidirectional);
  if (padding) s += getPadding(bidirectional);

  return s;
};

interface UseComponentSizeOptions extends GetTotalSizeOptions {
  useDefinedWidth?: boolean;
}

export const computeMinSize = (
  node: ElementNode,
  side: 'x' | 'y',
  {
    margin = true,
    padding = true,
    size = true,
    useDefinedWidth = true,
  }: UseComponentSizeOptions = {}
): number => {
  const bidirectional = node[side];

  if (useDefinedWidth && typeof bidirectional.size === 'number')
    return getTotalSize(bidirectional, { margin, padding, size });

  if (!node.children) return getTotalSize(bidirectional, { margin, padding, size: false });

  let min = 0;

  switch (bidirectional.direction) {
    case 'row':
      min = node.children.reduce((acc, child) => acc + computeMinSize(child, side), 0);
      break;
    case 'column':
      min = Math.max(...node.children.map((child) => computeMinSize(child, side)));
      break;
  }

  return getTotalSize({ ...bidirectional, size: min }, { margin, padding, size });
};

export const getPositionalDelta = (instruction: Instruction, side: 'x' | 'y'): number => {
  switch (instruction.style.location) {
    case 'start':
      return instruction[side].padding1;
    case 'center': {
      const childrenSize = computeMinSize(instruction, side, {
        margin: false,
        padding: false,
        useDefinedWidth: false,
      });

      return (instruction[side].size - childrenSize) / 2;
    }
    case 'end':
      throw new Error('end location is not implemented');
  }
};
