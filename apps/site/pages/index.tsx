/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import Image from "next/image";
import bedwarsPicture from "../public/bedwars.png";
import skywarsPicture from "../public/skywars.png";
import styled from "styled-components";
import { Code } from "../components/Code";
import { Feature } from "../components/Feature";
import { Invite } from "../components/Invite";
import { StatCircle } from "../components/StatCircle";

const StatCircles = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  background-color: #111111;

  width: 100%;

  padding-top: 40px;
  padding-bottom: 40px;

  @media (max-width: 640px) {
    flex-direction: column;
  }
`;

const BedWarsPicture = () => <Image src={bedwarsPicture} alt="bedwars" />;
const SkyWarsPicture = () => <Image src={skywarsPicture} alt="skywars" />;

const Index = () => (
  <>
    <StatCircles>
      <StatCircle title="Servers" value={80_000} />
      <StatCircle title="Commands Ran" value={45_000_000} />
    </StatCircles>
    <Feature
      title="Players"
      images={[<BedWarsPicture />, <SkyWarsPicture />]}
      align="left"
    >
      Beautiful visuals are provided by Statsify for each game's statistics on Hypixel for
      any player. Simply input <Code>/bedwars</Code> into Discord to see your BedWars
      statistics or those of your friends. To see further games, type <Code>/</Code>{" "}
      followed by the name of the game. To quickly search for yourself, you may link your
      Minecraft account to your Discord with <Code>/verify</Code>
    </Feature>
    <Feature
      title="Leaderboards"
      images={[<BedWarsPicture />, <SkyWarsPicture />]}
      align="right"
    >
      Using Statsify's robust leaderboard command, you can browse approximately 2,000
      leaderboards. The leaderboards may be seen using <Code>/leaderboard</Code> followed
      by the game and the stat. For instance, to display the leaderboard for Duels Classic
      Wins, for instance, write <Code>/leaderboard duels leaderboard: classic wins</Code>{" "}
      After executing the command, it is possible to rapidly switch to another player or
      position using the search buttons. Additionally, you may use the supplied buttons to
      browse across the leaderboard to examine the surrounding pages for that leaderboard.
    </Feature>
    <Feature
      title="Historical Stats"
      images={[<BedWarsPicture />, <SkyWarsPicture />]}
      align="left"
    >
      Using historical stats, Statsify allows you to display your statistics as if you
      began playing today. There is no need to worry about your past losses. To quickly
      obtain your daily stats, type <Code>/daily</Code> followed by the game. For example,
      enter <Code>/daily arcade</Code> to get your daily arcade statistics. The same holds
      true for weekly, monthly, and additional games.
    </Feature>
    <Feature
      title="Guilds"
      images={[<BedWarsPicture />, <SkyWarsPicture />]}
      align="right"
    >
      Statsify makes managing your guild easier. Simply enter <Code>/guild top</Code> to
      see the members of your guild with the most GEXP for the day, week, or month. Track
      individual guild members and their GEXP with the <Code>/guild member</Code> command.
      Use <Code>/guild leaderboard</Code> to see your guild's place on the leaderboards.
      Statsify's unique features, such as monthly GEXP, make it simple to promote and
      demote users and monitor their long-term success. Using <Code>/guild overall</Code>,
      you can quickly compare your guild against others.
    </Feature>
    <Feature
      title="Miscellaneous"
      images={[<BedWarsPicture />, <SkyWarsPicture />]}
      align="left"
    >
      Statsify has a plethora of additional helpful hypixel utilities. For example, using
      <Code>/friends</Code> to access any player's friend list or <Code>/mutuals</Code> to
      see mutual friends between players Statsify also allows you to monitor player
      activity using the <Code>/status</Code> and <Code>/recentgames</Code> commands.
      Using <Code>/gamecounts</Code>, you can track Hypixel's game popularity without ever
      opening Minecraft.
    </Feature>
    <Feature
      title="Minecraft"
      images={[<BedWarsPicture />, <SkyWarsPicture />]}
      align="right"
    >
      Statsify gives options for seeing a player's overall Minecraft profile. With{" "}
      <Code>/skin</Code>, you can easily steal a player's skin. Run{" "}
      <Code>/namehistory</Code> to see a player's prior names. Alternatively, use{" "}
      <Code>/cape</Code> to see a player's capes. Using <Code>/text</Code> you can create
      your own Minecraft text.
    </Feature>
    <Invite />
  </>
);

export default Index;
