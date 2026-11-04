/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Background, type BackgroundName } from "~/components/ui/background";
import { Chevron } from "~/components/icons/chevron";
import { Box } from "~/components/ui/box";
import { Link, type LinkProps } from "@tanstack/react-router";
import { type ReactNode, useEffect, useState } from "react";
import { cn } from "~/lib/util";
import { useTranslation } from "react-i18next";

/** One line of a page's contents: a section's id, its heading and, for a list, how many it holds. */
export interface ContentsItem {
  id: string;
  label: ReactNode;
  count?: number;
}

/**
 * The layout of the site's text pages (about, the glossary, prestiges, privacy, terms): the title and a meta line over
 * one reading column, with the page's contents in a rail beside it from `lg` and folded into a panel above it on
 * phones. A page brings only its content.
 */
export function TextPage({
  title,
  meta,
  contents,
  background = "general",
  children,
}: {
  title: ReactNode;
  meta?: ReactNode;
  contents: ContentsItem[];
  background?: BackgroundName;
  children: ReactNode;
}) {
  const current = useCurrentSection(contents.map(({ id }) => id));

  return (
    <div className="relative grow">
      <Background
        background={background}
        priority
        viewport
        className="h-full"
        mask="linear-gradient(rgb(255 255 255) 20%, rgb(0 0 0 / 0) 95%)"
      />
      <div className="absolute h-full w-full bg-[rgb(17_17_17_/0.7)] -z-10" />
      <div className="w-container px-4 pt-8 pb-12 text-mc-white md:px-8 md:pt-12 md:pb-16">
        <div className="grid items-start gap-6 lg:grid-cols-[280px_minmax(0,768px)] lg:justify-center lg:gap-8">
          <Rail contents={contents} current={current} />
          <div className="flex min-w-0 flex-col gap-6">
            <header className="flex flex-col gap-2">
              <h1 className="text-mc-2 lg:text-mc-3 font-bold">{title}</h1>
              {meta && <p className="text-mc-1 text-mc-gray">{meta}</p>}
            </header>
            <FoldedContents contents={contents} />
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

/** The contents beside the column from `lg`, following the reader down the page. */
function Rail({ contents, current }: { contents: ContentsItem[]; current?: string }) {
  const { t } = useTranslation();

  return (
    // A long list (the glossary's games) scrolls inside the rail, so its end is reachable while the rail sticks.
    <Box
      as="nav"
      aria-label={t("content.contents")}
      className="sticky top-6 hidden lg:block content:max-h-[calc(100dvh-3rem)] content:overflow-y-auto content:py-3"
    >
      <p className="mb-1 px-2 text-mc-1 text-mc-gray">{t("content.contents")}</p>
      <ContentsList contents={contents} current={current} />
    </Box>
  );
}

/** The contents on phones, folded above the column like the leaderboard index's groups. */
function FoldedContents({ contents }: { contents: ContentsItem[] }) {
  const { t } = useTranslation();

  return (
    <Box as="nav" aria-label={t("content.contents")} className="lg:hidden content:py-2">
      <details className="group">
        <summary className="flex min-h-11 cursor-pointer list-none items-center gap-3 text-mc-1.5 font-bold select-none [&::-webkit-details-marker]:hidden">
          <span className="grow">
            {t("content.contents")} <span className="font-normal text-mc-gray">({contents.length})</span>
          </span>
          <Chevron className="size-6 shrink-0 text-mc-gray transition-transform group-open:rotate-90" />
        </summary>
        <ContentsList contents={contents} />
      </details>
    </Box>
  );
}

function ContentsList({ contents, current }: { contents: ContentsItem[]; current?: string }) {
  return (
    <ol>
      {contents.map(({ id, label, count }) => (
        <li key={id}>
          <a
            href={`#${id}`}
            aria-current={id === current ? "location" : undefined}
            className="flex min-h-11 items-center justify-between gap-2 px-2 text-mc-1.5 text-white/60 hover:bg-white/10 hover:text-white aria-[current=location]:bg-white/10 aria-[current=location]:font-bold aria-[current=location]:text-white"
          >
            <span>{label}</span>
            {count !== undefined && <span className="font-normal text-mc-gray">{count}</span>}
          </a>
        </li>
      ))}
    </ol>
  );
}

const sectionTop = (id: string) => document.querySelector(`#${CSS.escape(id)}`)?.getBoundingClientRect().top ?? Infinity;

/** The last section whose heading has scrolled above the top quarter of the window, else the first. */
function useCurrentSection(ids: string[]): string | undefined {
  const [current, setCurrent] = useState(ids[0]);
  const key = ids.join(" ");

  useEffect(() => {
    const sections = key.split(" ");
    let frame = 0;

    const update = () => {
      frame = 0;
      const line = window.innerHeight / 4;
      const passed = sections.filter((id) => sectionTop(id) <= line);
      setCurrent(passed.at(-1) ?? sections[0]);
    };

    const schedule = () => {
      frame ||= requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });

    return () => {
      window.removeEventListener("scroll", schedule);
      cancelAnimationFrame(frame);
    };
  }, [key]);

  return current;
}

/** One section of a legal page. */
export interface LegalSection {
  id: string;
  title: string;
  body: ReactNode;
}

/**
 * A legal page (privacy, terms): the same English text on every locale, so a translation can't drift from the text that
 * applies. Only the page's chrome translates: the contents' heading and the date line.
 */
export function LegalPage({
  title,
  updated,
  intro,
  sections,
}: {
  title: string;
  /** When the text last changed, `YYYY-MM-DD`. */
  updated: string;
  intro: ReactNode;
  sections: LegalSection[];
}) {
  const { t, i18n } = useTranslation();
  // A UTC date, so the server and the browser print the same day.
  const date = new Intl.DateTimeFormat(i18n.language, { dateStyle: "long", timeZone: "UTC" }).format(new Date(`${updated}T00:00:00Z`));

  return (
    <TextPage
      title={<span lang="en">{title}</span>}
      meta={t("content.updated", { date })}
      contents={sections.map(({ id, title }) => ({ id, label: <span lang="en">{title}</span> }))}
    >
      <Article lang="en">
        {/* The sections after it keep their space above, as each section does after the one before. */}
        <div className="flex flex-col gap-4">{intro}</div>
        {sections.map(({ id, title, body }) => (
          <Section key={id} id={id} title={title}>
            {body}
          </Section>
        ))}
      </Article>
    </TextPage>
  );
}

/**
 * A panel of reading text: Mona Sans at 16, 20 from `lg`, lines kept to 68 characters. `lang` marks text that stays in
 * one language whatever the page's locale (the legal pages are English only).
 */
export function Article({ children, lang, className }: { children: ReactNode; lang?: string; className?: string }) {
  return (
    <Box className={cn("content:p-4 lg:content:px-10 lg:content:pt-8 lg:content:pb-10", className)}>
      <div lang={lang} className="font-sans text-16 leading-[1.6] font-medium text-mc-gray lg:text-20">
        {children}
      </div>
    </Box>
  );
}

/** A section of an article: a heading the contents link to, then its paragraphs. */
export function Section({ id, title, children }: { id: string; title: ReactNode; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4 not-first:mt-10 lg:not-first:mt-14">
      <h2 id={id} className="-mb-2 scroll-mt-6 text-mc-1.5 lg:text-mc-2 font-bold text-white">
        {title}
      </h2>
      {children}
    </section>
  );
}

export function Subheading({ children }: { children: ReactNode }) {
  return <h3 className="mt-4 -mb-2 text-mc-1 lg:text-mc-1.5 font-bold text-white">{children}</h3>;
}

export function Paragraph({ children }: { children: ReactNode }) {
  return <p className="max-w-[68ch]">{children}</p>;
}

/** A list with the site's square bullets. */
export function List({ children }: { children: ReactNode }) {
  return (
    <ul className="flex max-w-[68ch] flex-col gap-2 [&>li]:relative [&>li]:pl-6 [&>li]:before:absolute [&>li]:before:top-[0.7em] [&>li]:before:left-1 [&>li]:before:size-1.5 [&>li]:before:bg-mc-dark-gray">
      {children}
    </ul>
  );
}

// `children` is optional on the inline pieces so translated text can place them (`<Trans components={…}>`).
export function Strong({ children }: { children?: ReactNode }) {
  return <strong className="font-semibold text-white">{children}</strong>;
}

const TEXT_LINK = "font-semibold text-white underline decoration-2 underline-offset-3 hover:text-mc-aqua";

/** A link in reading text: to a page of the site, or anywhere by `href` (mail, vanity links the server redirects). */
export function TextLink({ children, href, ...link }: { children?: ReactNode } & ({ href: string } | (LinkProps & { href?: never }))) {
  if (href !== undefined) {
    return (
      <a href={href} className={TEXT_LINK}>
        {children}
      </a>
    );
  }

  return (
    <Link {...link} className={TEXT_LINK}>
      {children}
    </Link>
  );
}

const CALLOUT_TONES = {
  /** Something worth knowing about the text around it. */
  note: { rule: "border-mc-gold", label: "text-mc-gold" },
  /** A legal line, such as the Minecraft and Hypixel notices. */
  legal: { rule: "border-mc-gray", label: "text-mc-gray" },
};

/** A darker inset with a § colour rule down its left and a Minecraft label. */
export function Callout({ label, tone = "note", children }: { label: ReactNode; tone?: keyof typeof CALLOUT_TONES; children: ReactNode }) {
  const { rule, label: labelColour } = CALLOUT_TONES[tone];

  return (
    <div className={cn("flex max-w-[68ch] flex-col gap-2 border-l-4 bg-black/35 p-4", rule)}>
      <span className={cn("text-mc-1 font-bold", labelColour)}>{label}</span>
      {children}
    </div>
  );
}

/**
 * A two-column table of labels and values, which scrolls inside its panel rather than the page. On phones each row
 * stacks, the label over its value.
 */
export function KeyTable({ head, rows }: { head: [ReactNode, ReactNode]; rows: [label: ReactNode, value: ReactNode][] }) {
  return (
    <div className="overflow-x-auto bg-black/20">
      <table className="w-full border-collapse text-16 leading-normal">
        <thead className="max-sm:hidden">
          <tr>
            {head.map((cell, index) => (
              <th key={index} className="border-b-2 border-black/30 bg-black/20 px-4 py-3 text-start text-mc-1 font-normal text-mc-gray whitespace-nowrap">
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(([label, value], index) => (
            <tr key={index} className="max-sm:block not-first:border-t-2 border-black/20">
              <td className="px-4 py-3 align-top text-mc-1 text-white whitespace-nowrap max-sm:block max-sm:pb-0">{label}</td>
              <td className="px-4 py-3 align-top max-sm:block max-sm:pt-1">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** The pixel bevel of the site's inline insets: 2 px corners and no radius. */
export const CHIP = "inline-flex items-baseline gap-1.5 bg-black/45 px-2 py-0.5 whitespace-nowrap [clip-path:polygon(2px_0,calc(100%-2px)_0,100%_2px,100%_calc(100%-2px),calc(100%-2px)_100%,2px_100%,0_calc(100%-2px),0_2px)]";
