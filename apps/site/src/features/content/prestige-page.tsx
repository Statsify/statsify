/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Article, Paragraph, TextPage } from "./text-page";
import { BOX_GAP, Box, CELL, HEADING_BOX } from "~/components/ui/box";
import { MinecraftText } from "~/components/ui/minecraft-text";
import { cn } from "~/lib/util";
import { useNumberFormat } from "~/i18n/use-number-format";
import { useTranslation } from "react-i18next";
import type { PrestigeSheet } from "@statsify/contract";
import type { ReactNode } from "react";

/** Each panel holds a thousand stars' prestiges. */
const PANEL_LEVELS = 1000;

/** The level the star and bracket samples show. */
const SAMPLE_LEVEL = 100;

type Prestige = PrestigeSheet["prestiges"][number];

/**
 * Every BedWars prestige in the colours its level shows in game, a panel per thousand stars, then the game's other stars
 * and brackets. Drawn from the same scheme map as the cards, so a change to it shows here.
 */
export function PrestigePage({ sheet }: { sheet: PrestigeSheet }) {
  const { t } = useTranslation();
  const n = useNumberFormat();
  const { prestiges, stars, brackets } = sheet;
  const top = prestiges[prestiges.length - 1].level;

  // Not `Map.groupBy`, which Safari has only since 17.4.
  const panels = new Map<number, Prestige[]>();
  for (const prestige of prestiges) {
    const from = Math.floor(prestige.level / PANEL_LEVELS) * PANEL_LEVELS;
    panels.set(from, [...(panels.get(from) ?? []), prestige]);
  }

  const range = (from: number) => (from === top ? n(from) : `${n(from)}–${n(Math.min(from + PANEL_LEVELS - 1, top))}`);
  const sections = [...panels].map(([from, group]) => ({
    id: `stars-${from}`,
    heading: `${group[0].star} ${range(from)}`,
    group,
  }));

  const contents = [
    ...sections.map(({ id, heading, group }) => ({ id, label: heading, count: group.length })),
    { id: "stars", label: t("prestiges.stars") },
    { id: "brackets", label: t("prestiges.brackets") },
  ];

  return (
    <TextPage
      title={t("prestiges.title")}
      meta={t("prestiges.meta", { prestiges: n(prestiges.length) })}
      contents={contents}
      background="bedwars"
    >
      <Article short>
        <Paragraph>{t("prestiges.intro", { top: n(top), exp: n(prestiges[1].exp) })}</Paragraph>
      </Article>
      {sections.map(({ id, heading, group }) => (
        <Panel key={id} id={id} heading={heading} count={group.length} className="md:grid-cols-5">
          {group.map((prestige) => (
            <PrestigeCell key={prestige.level} prestige={prestige} />
          ))}
        </Panel>
      ))}
      <Panel id="stars" heading={t("prestiges.stars")} className="md:grid-cols-4 lg:grid-cols-5">
        {stars.map(({ key, name, glyph }) => (
          <Cell key={key} name={name} level={`§7[§f${SAMPLE_LEVEL}${glyph}§7]`} />
        ))}
      </Panel>
      <Panel id="brackets" heading={t("prestiges.brackets")} className="md:grid-cols-4">
        {brackets.map(({ key, name, open, close }) => (
          <Cell key={key} name={name} level={`§7${open}§f${SAMPLE_LEVEL}${stars[0].glyph}§7${close}`} />
        ))}
      </Panel>
    </TextPage>
  );
}

/** A heading in its own box over a grid of cells, two across on phones and `className`'s columns from `md`, 4 px apart. */
function Panel({ id, heading, count, className, children }: { id: string; heading: string; count?: number; className: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className={cn("grid scroll-mt-6 grid-cols-2", BOX_GAP, className)}>
      <Box className={HEADING_BOX}>
        <h2 id={`${id}-heading`} className="text-mc-1.5 font-bold">
          {heading} {count !== undefined && <span className="font-normal text-mc-gray">{count}</span>}
        </h2>
      </Box>
      {children}
    </section>
  );
}

function PrestigeCell({ prestige: { name, formatted, exp } }: { prestige: Prestige }) {
  const { t } = useTranslation();
  const n = useNumberFormat();
  return <Cell name={name} level={formatted} exp={t("prestiges.exp", { exp: n(exp) })} />;
}

/** A cell in its own box like the card's stat cells: the name over the level as the game draws it. */
function Cell({ name, level, exp }: { name: string; level: string; exp?: string }) {
  return (
    <Box className={cn(CELL, "content:flex-col content:gap-1 content:px-2 content:py-3 content:text-center")}>
      <span className="text-mc-1">{name}</span>
      <MinecraftText className="text-mc-1.5 whitespace-nowrap lg:text-mc-2">{level}</MinecraftText>
      {exp && <span className="text-mc-1 text-mc-gray">{exp}</span>}
    </Box>
  );
}
