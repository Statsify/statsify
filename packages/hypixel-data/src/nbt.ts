/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

export type Tag = number | bigint | string | Tag[] | Compound | Int8Array | Int32Array | BigInt64Array;
export interface Compound {
  [name: string]: Tag;
}

/** Reads uncompressed Java NBT, the format inventories are stored in */
export function readNbt(data: Uint8Array): Compound {
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  const decoder = new TextDecoder();
  let offset = 0;

  // Takes a value just read at offset and moves offset past its bytes
  const advance = <T>(bytes: number, value: T) => {
    offset += bytes;
    return value;
  };

  const int = () => advance(4, view.getInt32(offset));
  const long = () => advance(8, view.getBigInt64(offset));

  const string = () => {
    const length = advance(2, view.getUint16(offset));
    return advance(length, decoder.decode(data.subarray(offset, offset + length)));
  };

  const read = (type: number): Tag => {
    switch (type) {
      case 1:
        return view.getInt8(offset++);

      case 2:
        return advance(2, view.getInt16(offset));

      case 3:
        return int();

      case 4:
        return long();

      case 5:
        return advance(4, view.getFloat32(offset));

      case 6:
        return advance(8, view.getFloat64(offset));

      case 7: {
        const length = int();
        return advance(length, new Int8Array(data.slice(offset, offset + length).buffer));
      }

      case 8:
        return string();

      case 9: {
        const element = view.getInt8(offset++);
        return Array.from({ length: int() }, () => read(element));
      }

      case 10: {
        const compound: Compound = {};

        for (let child = view.getInt8(offset++); child !== 0; child = view.getInt8(offset++)) {
          compound[string()] = read(child);
        }

        return compound;
      }

      case 11:
        return Int32Array.from({ length: int() }, int);

      case 12:
        return BigInt64Array.from({ length: int() }, long);

      default:
        throw new Error(`Unknown NBT tag type ${type} at byte ${offset}`);
    }
  };

  const type = view.getInt8(offset++);
  if (type !== 10) throw new Error(`NBT should start with a compound, not tag type ${type}`);

  string();
  return read(10) as Compound;
}

if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest;

  describe("readNbt", () => {
    it("reads compounds, lists, strings and numbers", () => {
      // {"": {i: [{id: 276s, Count: 1b, tag: {display: {Name: "Hi"}}}, {}]}}
      const bytes = [
        10, 0, 0,
        9, 0, 1, 0x69, 10, 0, 0, 0, 2,
        2, 0, 2, 0x69, 0x64, 0x01, 0x14,
        1, 0, 5, 0x43, 0x6f, 0x75, 0x6e, 0x74, 1,
        10, 0, 3, 0x74, 0x61, 0x67,
        10, 0, 7, 0x64, 0x69, 0x73, 0x70, 0x6c, 0x61, 0x79,
        8, 0, 4, 0x4e, 0x61, 0x6d, 0x65, 0, 2, 0x48, 0x69,
        0, 0, 0,
        0,
        0,
      ];

      expect(readNbt(new Uint8Array(bytes))).toEqual({
        i: [{ id: 276, Count: 1, tag: { display: { Name: "Hi" } } }, {}],
      });
    });
  });
}
