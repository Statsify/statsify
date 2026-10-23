/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

/* eslint-disable react/no-unescaped-entities -- English reading text, with its apostrophes and quotes as written */

import { KeyTable, LegalPage, type LegalSection, List, Paragraph, Subheading, TextLink } from "./text-page";

/** When the policy last changed. */
const UPDATED = "2026-10-22";

const EMAIL = "contact@statsify.net";
const mail = <TextLink href={`mailto:${EMAIL}`}>{EMAIL}</TextLink>;
const discord = <TextLink href="/discord">Statsify Discord</TextLink>;

// One policy for the bot and the site.
const SECTIONS: LegalSection[] = [
  {
    id: "who",
    title: "Who's Responsible",
    body: (
      <>
        <Paragraph>
          Statsify's owners, who operate Statsify (statsify.net) from the United States, decide how this data is used.
        </Paragraph>
        <Paragraph>
          Privacy contact: {mail}. You can also open a ticket in the {discord}. Security problems go to the same address.
        </Paragraph>
      </>
    ),
  },
  {
    id: "players",
    title: "Hypixel Players",
    body: (
      <>
        <Paragraph>
          When anyone looks a player up, on this site or with the bot, Statsify fetches the player's public stats from Hypixel's
          API, and their name, UUID and skin from Mojang. It keeps them so pages load quickly, so leaderboards can rank the
          player, and so the bot can show how their stats change over time. That includes players who have never used Statsify.
        </Paragraph>
        <Paragraph>
          Statsify does this on the basis of its legitimate interest in showing stats that Hypixel makes public.
        </Paragraph>
        <Paragraph>
          To have your stats removed, or to object, email {mail}. We'll ask you to show the account is yours, usually by linking it
          with the bot's verify command. Removal takes you off Statsify's leaderboards and deletes the stats Statsify keeps. Your
          stats stay public on Hypixel, so a later lookup could fetch them again.
        </Paragraph>
      </>
    ),
  },
  {
    id: "bot",
    title: "The Discord Bot",
    body: (
      <>
        <Paragraph>
          When you link your Minecraft account with the verify command, Statsify keeps your Discord ID and your Minecraft UUID,
          so commands can show your stats without your name. It also keeps the settings you pick, such as your card's theme and
          language, whether you're a member or booster of the {discord}, and your premium tier if you support Statsify.
        </Paragraph>
        <Paragraph>This is kept while your account is linked. Run the unverify command to unlink it.</Paragraph>
      </>
    ),
  },
  {
    id: "site",
    title: "Visiting statsify.net",
    body: (
      <>
        <Subheading>Your IP Address</Subheading>
        <Paragraph>
          Statsify uses your IP address to limit how often you can update or look up players, so no one can use up its share of
          Hypixel's API. The count is kept for 5 minutes, then deleted. When you look up a player Statsify hasn't seen, your IP
          address also goes to Cloudflare Turnstile, which checks that you're a person.
        </Paragraph>
        <Subheading>Logs</Subheading>
        <Paragraph>
          The site runs behind Cloudflare and nginx, which log each request: the page, the time, your IP address and your
          browser's user agent. The logs are kept for 14 days.
        </Paragraph>
        <Subheading>Error Reports</Subheading>
        <Paragraph>
          When something breaks, in your browser or on the server, an error report goes to Sentry: the page's address, the error,
          and your browser and operating system. For some visits, it also gets how long the page took to load. Reports are kept
          for 90 days. Sentry doesn't store IP addresses.
        </Paragraph>
        <Subheading>In Your Browser</Subheading>
        <Paragraph>
          The site remembers the players you viewed recently in your browser's storage, so it can show them to you again. That list
          stays on your device and is never sent to Statsify. Clearing the site's data in your browser deletes it.
        </Paragraph>
        <Subheading>Cookies</Subheading>
        <Paragraph>
          Statsify sets no cookies. Cloudflare may set its own security cookies to tell people from bots, such as __cf_bm, which
          expires after 30 minutes. They're used for security, not tracking.
        </Paragraph>
      </>
    ),
  },
  {
    id: "analytics",
    title: "Analytics",
    body: <Paragraph>Statsify doesn't use analytics.</Paragraph>,
  },
  {
    id: "ads",
    title: "Ads",
    body: <Paragraph>Statsify shows no ads, and nothing it keeps is used for advertising.</Paragraph>,
  },
  {
    id: "sharing",
    title: "Who Else Handles It",
    body: (
      <>
        <Paragraph>Statsify never sells data. These services handle some of it to run Statsify:</Paragraph>
        <List>
          <li>Cloudflare, which carries the site's traffic, protects it and runs Turnstile.</li>
          <li>Sentry, which keeps error reports.</li>
          <li>Discord, which carries the bot's commands under its own privacy policy.</li>
          <li>Hypixel and Mojang, where stats, names and skins come from. Statsify sends them the names and UUIDs it looks up.</li>
          <li>Patreon, if you support Statsify there, under its own privacy policy.</li>
        </List>
        <Paragraph>
          Statsify stores the data it keeps in the United States. If you're outside the United States, your data goes there:
          Statsify collects it from you directly, and Cloudflare and Sentry handle data from the EEA, the UK and Switzerland under
          the EU-U.S. Data Privacy Framework and its UK and Swiss extensions, or the EU's Standard Contractual Clauses.
        </Paragraph>
      </>
    ),
  },
  {
    id: "retention",
    title: "How Long It's Kept",
    body: (
      <KeyTable
        head={["Data", "Kept"]}
        rows={[
          ["IP address counts", "5 minutes"],
          ["Request logs", "14 days"],
          ["Error reports", "90 days"],
          ["Linked accounts and settings", "Until you unlink them with the unverify command"],
          ["Hypixel players' stats", "Until the player asks for them to be removed"],
          ["Recently viewed players", "On your device, until you clear them"],
        ]}
      />
    ),
  },
  {
    id: "rights",
    title: "Your Rights",
    body: (
      <>
        <Paragraph>Wherever you live, you can ask for a copy of your data, and have it corrected or deleted.</Paragraph>
        <Paragraph>
          In the EEA, the UK and Switzerland, you can also object to how it's used, ask for it in a portable format, and complain
          to your data protection authority.
        </Paragraph>
        <Paragraph>
          In US states with privacy laws, you can ask what Statsify knows about you and have it deleted. Statsify doesn't sell or
          share personal information, so there's nothing to opt out of.
        </Paragraph>
        <Paragraph>
          Email {mail} or open a ticket in the {discord}. To check a request is yours, we'll ask you to link the account with the
          bot's verify command, or to show it's yours another way.
        </Paragraph>
      </>
    ),
  },
  {
    id: "children",
    title: "Children",
    body: (
      <Paragraph>
        Statsify isn't meant for children under 13, and doesn't knowingly collect their personal information. Discord accounts
        need the same minimum age. If you're a parent or guardian and think your child gave Statsify personal data, email {mail}{" "}
        and we'll delete it.
      </Paragraph>
    ),
  },
  {
    id: "changes",
    title: "Changes",
    body: (
      <Paragraph>
        When this policy changes, so does the date at the top. Big changes are also announced in the {discord}.
      </Paragraph>
    ),
  },
];

export function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated={UPDATED}
      intro={
        <Paragraph>
          Statsify doesn't sell your data or use it for ads. This policy covers the Statsify Discord bot and statsify.net: what
          they collect, why, how long it's kept, and how to see, change or delete it. It's part of the{" "}
          <TextLink to="/{-$locale}/terms">Terms of Service</TextLink>.
        </Paragraph>
      }
      sections={SECTIONS}
    />
  );
}
