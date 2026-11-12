/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Article, CHIP, Paragraph, READING_LEADING, READING_SIZE, TextLink, TextPage } from "./text-page";
import { BOX_GAP, Box, HEADING_BOX } from "~/components/ui/box";
import { FilterBox, wordMatcher } from "~/components/filter-box";
import { Link } from "@tanstack/react-router";
import { MinecraftText } from "~/components/ui/minecraft-text";
import { Trans, useTranslation } from "react-i18next";
import { type ReactNode, useState } from "react";
import { LABEL_NAMESPACES } from "~/i18n/i18n";
import { cn } from "~/lib/util";
import { useNumberFormat } from "~/i18n/use-number-format";
import type { GlossaryGroup, GlossaryItem } from "./content-data";

const TEXT = cn("max-w-[68ch] text-mc-gray", READING_SIZE, READING_LEADING);

/**
 * What every stat the site shows means, grouped as the ratios, the stats several games share, then each game's own. Each
 * entry's id is its `glossary.*` key, so `/glossary#fkdr` lands on FKDR.
 */
export function GlossaryPage({ groups }: { groups: GlossaryGroup[] }) {
  const { t } = useTranslation();
  const n = useNumberFormat();
  const [filter, setFilter] = useState("");

  const label = (item: GlossaryItem) => t(item.label, { ns: LABEL_NAMESPACES, ...item.params });
  const groupName = ({ key, game }: GlossaryGroup) => game ?? t(`glossary.${key}`);
  const total = groups.reduce((sum, { items }) => sum + items.length, 0);

  const matches = wordMatcher(filter);
  const shown = groups
    .map((group) => ({ ...group, items: group.items.filter((item) => matches(`${label(item)} ${item.name ?? ""}`)) }))
    .filter(({ items }) => items.length > 0);
  const count = shown.reduce((sum, { items }) => sum + items.length, 0);

  return (
    <TextPage
      title={t("glossary.title")}
      meta={t("glossary.meta", { stats: n(total) })}
      contents={groups.map((group) => ({ id: group.key, label: groupName(group), count: group.items.length }))}
    >
      <Article>
        <div className="flex flex-col gap-4">
          <Paragraph>{t("glossary.intro")}</Paragraph>
          <Paragraph>
            <Trans i18nKey="glossary.levels" components={{ prestiges: <TextLink to="/{-$locale}/prestiges/bedwars" /> }} />
          </Paragraph>
        </div>
      </Article>
      <FilterBox
        value={filter}
        onChange={setFilter}
        label={t("glossary.filter")}
        count={t("filter.count", { shown: n(count), total: n(total) })}
      />
      {count === 0 && <p className="text-mc-1.5 text-mc-gray text-center">{t("glossary.noMatches", { query: filter.trim() })}</p>}
      {/* Each group's heading in a box of its own, then each stat in its own box, 4 px apart, as the bot's cards. */}
      {shown.map((group) => (
        <section
          key={group.key}
          id={group.key}
          aria-labelledby={`${group.key}-heading`}
          className={cn("flex scroll-mt-6 flex-col", BOX_GAP)}
        >
          <Box className={HEADING_BOX}>
            <h2 id={`${group.key}-heading`} className="text-mc-1.5 font-bold">
              {groupName(group)} <span className="font-normal text-mc-gray">{group.items.length}</span>
            </h2>
          </Box>
          {group.key === "ratios" && (
            <Box className="content:py-4">
              <p className={TEXT}>{t("glossary.ratiosNote")}</p>
            </Box>
          )}
          {group.items.map((item) => (
            <Entry key={item.key} item={item} label={label(item)} own={group.game !== null} />
          ))}
        </section>
      ))}
    </TextPage>
  );
}

/** One stat. `own`: it's under the one game that shows it, so the game isn't named again. */
function Entry({ item, label, own }: { item: GlossaryItem; label: string; own: boolean }) {
  const { t } = useTranslation();
  const n = useNumberFormat();
  const color = item.color ?? "§f";
  const games = item.games.join(", ");

  return (
    <Box id={item.key} className="scroll-mt-6 content:py-4 lg:content:px-6">
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <h3 className="text-mc-1.5 lg:text-mc-2">
          <MinecraftText>{`${color}${label}`}</MinecraftText>
        </h3>
        {item.name && <span className={cn("text-white", READING_SIZE)}>{item.name}</span>}
      </div>
      <p className={`${TEXT} mt-2`}>{item.text}</p>
      {item.formula && <Formula formula={item.formula} label={label} color={color} />}
      <div className={cn("mt-3 flex flex-wrap items-center gap-x-4 text-mc-gray empty:hidden", READING_SIZE)}>
        {!own && (
          <span className="inline-flex min-h-11 items-center">
            {item.more > 0 ? t("glossary.usedInMore", { games, more: n(item.more) }) : t("glossary.usedIn", { games })}
          </span>
        )}
        {item.link && (
          <BoardLink link={item.link} label={label}>
            {item.boards === 1 ? t("glossary.board") : t("glossary.boards", { boards: n(item.boards) })}{" "}
            <span aria-hidden className="text-mc-gray">»</span>
          </BoardLink>
        )}
      </div>
    </Box>
  );
}

const BOARD_LINK = "inline-flex min-h-11 items-center text-white hover:underline";

function BoardLink({ link, label, children }: { link: NonNullable<GlossaryItem["link"]>; label: string; children: ReactNode }) {
  if ("search" in link) {
    return (
      <Link to="/{-$locale}/leaderboards" search={{ q: label }} className={BOARD_LINK}>
        {children}
      </Link>
    );
  }

  return (
    <Link to="/{-$locale}/leaderboards/$field" params={{ field: link.field }} className={BOARD_LINK}>
      {children}
    </Link>
  );
}

/** A ratio as the stats it divides, as chips: Kills ÷ Deaths = KDR, with × 100 for a percentage. */
function Formula({ formula, label, color }: { formula: NonNullable<GlossaryItem["formula"]>; label: string; color: string }) {
  const { t } = useTranslation();
  const n = useNumberFormat();
  const part = (key: string) => t(key, { ns: LABEL_NAMESPACES });

  return (
    <p className={cn("mt-3 flex flex-wrap items-center gap-x-1 gap-y-2", READING_SIZE)}>
      <span className={`${CHIP} text-mc-green`}><span className="mc-crisp">{part(formula.numerator)}</span></span>
      <span className="mc-crisp px-0.5 text-mc-gray">÷</span>
      <span className={`${CHIP} text-mc-red`}><span className="mc-crisp">{part(formula.denominator)}</span></span>
      {formula.multiplier !== 1 && (
        <>
          <span className="mc-crisp px-0.5 text-mc-gray">×</span>
          <span className={CHIP}><span className="mc-crisp">{n(formula.multiplier)}</span></span>
        </>
      )}
      <span className="mc-crisp px-0.5 text-mc-gray">=</span>
      <span className={CHIP}>
        <MinecraftText className="mc-crisp">{`${color}${label}`}</MinecraftText>
      </span>
    </p>
  );
}
