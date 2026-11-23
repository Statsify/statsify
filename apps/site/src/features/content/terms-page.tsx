/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

/* eslint-disable react/no-unescaped-entities -- English reading text, with its apostrophes and quotes as written */

import { Callout, LegalPage, type LegalSection, List, Paragraph, TextLink } from "./text-page";

/** When the terms last changed. */
const UPDATED = "2026-10-22";

const discord = <TextLink href="/discord">Statsify Discord</TextLink>;

// One set of terms for the bot and the site.
const SECTIONS: LegalSection[] = [
  {
    id: "official",
    title: "Not Official",
    body: (
      <>
        <Callout label="Notice" tone="legal">
          <Paragraph>NOT AN OFFICIAL MINECRAFT SERVICE. NOT APPROVED BY OR ASSOCIATED WITH MOJANG OR MICROSOFT.</Paragraph>
          <Paragraph>Statsify is not affiliated with or endorsed by Hypixel Inc.</Paragraph>
        </Callout>
        <Paragraph>Minecraft is a trademark of Mojang. Other names and logos belong to their owners.</Paragraph>
      </>
    ),
  },
  {
    id: "use",
    title: "Using Statsify",
    body: (
      <>
        <Paragraph>You must not:</Paragraph>
        <List>
          <li>automate your use of the bot, or look players up on the site with scripts or scrapers beyond normal use;</li>
          <li>get around Statsify's rate limits or its lookup check;</li>
          <li>spam commands that trigger the bot, whatever a server's own rules say;</li>
          <li>abuse, exploit or otherwise misuse Statsify, or show the site inside another page;</li>
          <li>break anyone's rights, such as their privacy or intellectual property, through Statsify;</li>
          <li>send unsolicited messages, or break the terms of Discord or any other platform, through Statsify.</li>
        </List>
        <Paragraph>We may block anyone who breaks these terms from the bot, the site or both.</Paragraph>
      </>
    ),
  },
  {
    id: "stats",
    title: "Stats Are As Is",
    body: (
      <Paragraph>
        Stats come from Hypixel and can be out of date, hidden by the player, or wrong. Leaderboards only rank players someone
        has looked up on Statsify. Statsify can be slow or down at times, and there's no promised uptime. We fix mistakes when we
        find them, without notice.
      </Paragraph>
    ),
  },
  {
    id: "leaderboards",
    title: "Fair Leaderboards",
    body: (
      <Paragraph>
        We may take accounts off leaderboards that we believe are boosted, cheating or otherwise unfair, and set rules for who's
        ranked, such as a minimum number of games on ratio leaderboards.
      </Paragraph>
    ),
  },
  {
    id: "purchases",
    title: "Premium and Purchases",
    body: (
      <>
        <Paragraph>
          If you buy something from Statsify, such as premium, a payment service takes the payment under its own terms. You
          confirm that you're allowed to use the payment method, and that what you give is true and complete. We may refuse or
          cancel an order, for example if the item isn't available, was described or priced wrongly, or we suspect fraud.
        </Paragraph>
        <Paragraph>
          Premium is cosmetic and convenience only, and never gives a gameplay advantage. Premium bought through Patreon renews
          each month until you cancel it there, and stays active until the end of the period you paid for. Refunds follow
          Patreon's policy.
        </Paragraph>
      </>
    ),
  },
  {
    id: "branding",
    title: "Statsify's Name and Logo",
    body: (
      <Paragraph>
        Don't use Statsify's name or logo in a way that harms the brand, misleads people, or targets anyone.
      </Paragraph>
    ),
  },
  {
    id: "code",
    title: "Code and Content",
    body: (
      <Paragraph>
        Statsify's code is open source under the GNU AGPL v3 or later, <TextLink href="/github">on GitHub</TextLink>. The license
        covers the code, not the Statsify name and logo. Minecraft's assets belong to Mojang, and skins to their owners.
      </Paragraph>
    ),
  },
  {
    id: "links",
    title: "Other Websites",
    body: (
      <Paragraph>
        Statsify links to sites and services it doesn't run, such as Hypixel, Discord and Patreon. We aren't responsible for them
        or for anything lost by relying on them, so read their own terms and privacy policies.
      </Paragraph>
    ),
  },
  {
    id: "ending",
    title: "Ending Access",
    body: (
      <Paragraph>
        We may suspend or end your access to Statsify at any time, without notice, for any reason, including breaking these
        terms.
      </Paragraph>
    ),
  },
  {
    id: "disclaimer",
    title: "Disclaimer",
    body: (
      <>
        <Paragraph>
          You use Statsify at your own risk. It's provided "as is" and "as available", without warranties of any kind, express
          or implied, including merchantability, fitness for a particular purpose and non-infringement. We don't promise that it
          will work without interruption, be secure, or be available at any time or place, that errors will be fixed, or that it
          will meet your needs.
        </Paragraph>
        <Paragraph>
          To the fullest extent the law allows, Statsify and its owners aren't liable for indirect, incidental, special,
          consequential or punitive damages, or for lost profits, data or goodwill. Their total liability for any claim about
          Statsify is limited to the greater of what you paid Statsify in the 12 months before the claim, or US$50. You agree to
          cover the costs of claims against Statsify that come from you breaking these terms or misusing Statsify.
        </Paragraph>
        <Paragraph>If part of these terms can't be enforced, the rest still applies.</Paragraph>
      </>
    ),
  },
  {
    id: "changes",
    title: "Changes",
    body: (
      <Paragraph>
        When these terms change, so does the date at the top. Big changes are also announced in the {discord}. Using Statsify
        after a change means you accept it.
      </Paragraph>
    ),
  },
];

export function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      updated={UPDATED}
      intro={
        <Paragraph>
          These terms are an agreement between you and Statsify's owners, who operate Statsify. They cover the Statsify Discord
          bot and statsify.net, and include the{" "}
          <TextLink to="/{-$locale}/privacy">Privacy Policy</TextLink>. By using Statsify, you agree to them and confirm you're at
          least 13.
        </Paragraph>
      }
      sections={SECTIONS}
    />
  );
}
