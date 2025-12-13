/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

export const BoxColorIds = [
  "red",
  "yellow",
  "lightgray",
  "gold",
  "magenta",
  "green",
  "purple",
  "black",
  "pink",
  "beige",
];

export type BoxColorId = (typeof BoxColorIds)[number];

export type BoxColor = {
  background: string;
  outline: string;
  ribbonBackground: string;
  ribbonAccent: string;
  patternTop: string;
  patternBottom: string;
};

export const BoxColors: Record<BoxColorId, BoxColor> = {
  red: {
    background: "rgba(142, 0, 0, 0.4)",
    outline: "rgba(124, 0, 0, 1)",
    ribbonBackground: "rgba(0, 99, 7, 0.3)",
    ribbonAccent: "rgba(0, 142, 9, 1)",
    patternTop: "rgba(92, 19, 19, 0.39)",
    patternBottom: "rgba(70, 11, 11, 0.7)",
  },
  yellow: {
    background: "rgba(185, 114, 0, 0.4)",
    outline: "rgba(207, 142, 0, 1)",
    ribbonBackground: "rgba(103, 4, 4, 0.3)",
    ribbonAccent: "rgba(142, 0, 0, 1)",
    patternTop: "rgba(143, 93, 0, 0.39)",
    patternBottom: "rgba(121, 79, 3, 0.7)",
  },
  lightgray: {
    background: "rgba(147, 147, 147, 0.4)",
    outline: "rgba(158, 158, 158, 1)",
    ribbonBackground: "rgba(31, 131, 142, 0.3)",
    ribbonAccent: "rgba(88, 208, 208, 1)",
    patternTop: "rgba(64, 64, 64, 0.39)",
    patternBottom: "rgba(74, 74, 74, 0.7)",
  },
  gold: {
    background: "rgba(228, 106, 0, 0.4)",
    outline: "rgba(195, 127, 1, 1)",
    ribbonBackground: "rgba(19, 27, 76, 0.3)",
    ribbonAccent: "rgba(43, 0, 142, 1)",
    patternTop: "rgba(147, 101, 1, 0.39)",
    patternBottom: "rgba(153, 95, 0, 0.7)",
  },
  magenta: {
    background: "rgba(107, 30, 70, 0.4)",
    outline: "rgba(151, 46, 112, 1)",
    ribbonBackground: "rgba(108, 0, 0, 0.3)",
    ribbonAccent: "rgba(142, 0, 0, 1)",
    patternTop: "rgba(102, 9, 82, 0.39)",
    patternBottom: "rgba(80, 21, 67, 0.7)",
  },
  green: {
    background: "rgba(23, 140, 0, 0.4)",
    outline: "rgba(6, 128, 0, 1)",
    ribbonBackground: "rgba(130, 0, 0, 0.3)",
    ribbonAccent: "rgba(142, 0, 0, 1)",
    patternTop: "rgba(14, 83, 0, 0.39)",
    patternBottom: "rgba(23, 72, 0, 0.7)",
  },
  purple: {
    background: "rgba(65, 0, 109, 0.4)",
    outline: "rgba(57, 0, 128, 1)",
    ribbonBackground: "rgba(118, 95, 3, 0.3)",
    ribbonAccent: "rgba(142, 114, 0, 1)",
    patternTop: "rgba(50, 0, 103, 0.39)",
    patternBottom: "rgba(44, 0, 82, 0.7)",
  },
  black: {
    background: "rgba(25, 25, 25, 0.4)",
    outline: "rgba(39, 39, 39, 1)",
    ribbonBackground: "rgba(118, 10, 69, 0.3)",
    ribbonAccent: "rgba(142, 0, 73, 1)",
    patternTop: "rgba(28, 28, 28, 0.39)",
    patternBottom: "rgba(33, 33, 33, 0.7)",
  },
  pink: {
    background: "rgba(255, 89, 181, 0.4)",
    outline: "rgba(255, 81, 252, 1)",
    ribbonBackground: "rgba(35, 152, 146, 0.3)",
    ribbonAccent: "rgba(0, 201, 223, 1)",
    patternTop: "rgba(210, 74, 255, 0.39)",
    patternBottom: "rgba(165, 69, 174, 0.7)",
  },
  beige: {
    background: "rgba(188, 133, 70, 0.4)",
    outline: "rgba(228, 199, 104, 1)",
    ribbonBackground: "rgba(65, 44, 255, 0.3)",
    ribbonAccent: "rgba(71, 36, 200, 1)",
    patternTop: "rgba(139, 95, 25, 0.39)",
    patternBottom: "rgba(112, 87, 42, 0.7)",
  },
};
