/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Article, CHIP, Callout, KeyTable, Paragraph, Section, Subheading, TextLink, TextPage } from "./text-page";
import { Link } from "@tanstack/react-router";
import { PointerText } from "~/components/ui/hint";
import { Trans, useTranslation } from "react-i18next";
import { useNumberFormat } from "~/i18n/use-number-format";

/** What Statsify is, how to reach us, and where its stats come from. */
export function AboutPage() {
  const { t } = useTranslation();
  const links = { chip: <SampleChip />, glossary: <TextLink to="/{-$locale}/glossary" /> };
  const email = t("footer.email");
  const mail = <TextLink href={`mailto:${email}`}>{email}</TextLink>;

  return (
    <TextPage title={t("about.title")}>
      <Article short>
        <Section id="what" title={t("about.what")}>
          <Paragraph>{t("about.whatText")}</Paragraph>
          <Paragraph>
            <PointerText
              mouse={<Trans i18nKey="about.linksText" components={links} />}
              touch={<Trans i18nKey="about.linksTextTouch" components={links} />}
            />
          </Paragraph>
        </Section>
        <Section id="contact" title={t("about.contact")}>
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
          <Paragraph>{t("about.statsText")}</Paragraph>
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
