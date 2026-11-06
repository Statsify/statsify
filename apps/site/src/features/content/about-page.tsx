/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Article, CHIP, Callout, KeyTable, Paragraph, Section, Strong, Subheading, TextLink, TextPage } from "./text-page";
import { Link } from "@tanstack/react-router";
import { Trans, useTranslation } from "react-i18next";
import { useNumberFormat } from "~/i18n/use-number-format";

/** Who runs Statsify, how to reach them, and where its stats come from. */
export function AboutPage() {
  const { t } = useTranslation();
  const email = t("footer.email");
  const mail = <TextLink href={`mailto:${email}`}>{email}</TextLink>;

  const contents = [
    { id: "what", label: t("about.what") },
    { id: "operator", label: t("about.operator") },
    { id: "contact", label: t("about.contact") },
    { id: "stats", label: t("about.stats") },
    { id: "source", label: t("about.source") },
  ];

  return (
    <TextPage title={t("about.title")} contents={contents}>
      <Article>
        <Section id="what" title={t("about.what")}>
          <Paragraph>{t("about.whatText")}</Paragraph>
          <Paragraph>
            <Trans
              i18nKey="about.linksText"
              components={{ chip: <SampleChip />, glossary: <TextLink to="/{-$locale}/glossary" /> }}
            />
          </Paragraph>
        </Section>
        <Section id="operator" title={t("about.operator")}>
          <Paragraph>{t("about.operatorText")}</Paragraph>
          <Callout label={t("about.notOfficial")} tone="legal">
            <p>{t("footer.mojang")}</p>
            <p>{t("footer.affiliation")}</p>
          </Callout>
        </Section>
        <Section id="contact" title={t("about.contact")}>
          <Paragraph>{t("about.contactText")}</Paragraph>
          <KeyTable
            head={[t("about.topic"), t("about.where")]}
            rows={[
              [t("about.help"), <Trans key="help" i18nKey="about.helpWhere" components={{ discord: <TextLink href="/support" /> }} />],
              [t("about.privacy"), mail],
              [t("about.legal"), mail],
              [t("about.security"), mail],
            ]}
          />
        </Section>
        <Section id="stats" title={t("about.stats")}>
          <Paragraph>
            <Trans i18nKey="about.statsText" components={{ strong: <Strong /> }} />
          </Paragraph>
          <Callout label={t("about.note")}>
            <p>{t("about.leaderboardsNote")}</p>
          </Callout>
          <Subheading>{t("about.names")}</Subheading>
          <Paragraph>{t("about.namesText")}</Paragraph>
        </Section>
        <Section id="source" title={t("about.source")}>
          <Paragraph>
            <Trans i18nKey="about.sourceText" components={{ github: <TextLink href="/github" /> }} />
          </Paragraph>
        </Section>
      </Article>
    </TextPage>
  );
}

/** A player's FKDR as a card's inline row, linked to its leaderboard as every ranked stat is. */
function SampleChip() {
  const { t } = useTranslation();
  const n = useNumberFormat();

  return (
    <Link
      to="/{-$locale}/leaderboards/$field"
      params={{ field: "stats.bedwars.overall.fkdr" }}
      className={`${CHIP} mx-0.5 align-baseline text-mc-1 lg:text-mc-1.5 hover:bg-white/15`}
    >
      <span className="text-mc-gray">{t("stats.fkdr", { ns: "default" })}:</span>
      <span className="text-mc-gold">{n(3.42)}</span>
    </Link>
  );
}
