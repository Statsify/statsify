/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { CHIP, Callout, Paragraph, Section, Subheading, TAP_AREA, TextEmail, TextLink, TextPage } from "./text-page";
import { Link } from "@tanstack/react-router";
import { PointerText } from "~/components/ui/hint";
import type { ReactNode } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useNumberFormat } from "~/i18n/use-number-format";

/** What Statsify is, how to reach us, and where its stats come from. */
export function AboutPage() {
  const { t } = useTranslation();
  const links = { chip: <SampleChip />, glossary: <TextLink to="/{-$locale}/glossary" /> };
  const email = t("footer.email");
  const mail = <TextEmail email={email} className={TAP_AREA} />;
  const contacts: [label: string, where: ReactNode][] = [
    [t("about.help"), <Trans key="help" i18nKey="about.helpWhere" components={{ discord: <TextLink href="/support" className={TAP_AREA} /> }} />],
    [t("about.privacy"), mail],
    [t("about.legal"), mail],
    [t("about.security"), mail],
  ];

  return (
    <TextPage title={t("about.title")}>
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
        <dl className="flex flex-col gap-3">
          {contacts.map(([label, where]) => (
            <div key={label} className="mc-crisp">
              <dt className="inline">{label}:</dt> <dd className="inline">{where}</dd>
            </div>
          ))}
        </dl>
      </Section>
      <Section id="stats" title={t("about.stats")}>
        <Paragraph>{t("about.statsText")}</Paragraph>
        <Callout label={t("about.note")}>
          <Paragraph>{t("about.leaderboardsNote")}</Paragraph>
        </Callout>
        <Subheading>{t("about.names")}</Subheading>
        <Paragraph>{t("about.namesText")}</Paragraph>
      </Section>
      <Section id="source" title={t("about.source")}>
        <Paragraph>
          <Trans i18nKey="about.sourceText" components={{ github: <TextLink href="/github" /> }} />
        </Paragraph>
      </Section>
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
      className={`${CHIP} mx-0.5 align-baseline hover:bg-[#2e2e2e]`}
    >
      <span className="text-mc-gray">{t("stats.fkdr", { ns: "default" })}:</span>
      <span className="text-mc-gold">{n(3.42)}</span>
    </Link>
  );
}
