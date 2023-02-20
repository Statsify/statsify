/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import Image from "next/image";
import arcadeProfile from "../public/examples/arcade.png";
import bedwarsLeaderboard from "../public/examples/bedwars-leaderboard.png";
import bedwarsProfile from "../public/examples/bedwars.png";
import blitzsgLeaderboard from "../public/examples/blitzsg-leaderboard.png";
import buildbattleLeaderboard from "../public/examples/buildbattle-leaderboard.png";
import commandsImage from "../public/commands.svg";
import dailyMurderMysteryProfile from "../public/examples/daily-murdermystery.png";
import dailyTNTGamesProfile from "../public/examples/daily-tntgames.png";
import duelsProfile from "../public/examples/duels.png";
import guildMemberProfile from "../public/examples/guild-member.png";
import guildOverallGexpProfile from "../public/examples/guild-overall-gexp.png";
import guildOverallProfile from "../public/examples/guild-overall.png";
import guildTopProfile from "../public/examples/guild-top.png";
import recentGamesProfile from "../public/examples/recentgames.png";
import serversImage from "../public/servers.svg";
import skinEmbed from "../public/examples/skin.png";
import skywarsProfile from "../public/examples/skywars.png";
import woolwarsLeaderboard from "../public/examples/woolwars-leaderboard.png";
import { Code } from "../components/Code";
import { Feature } from "../components/Feature";
import { Invite } from "../components/Invite";
import { StatCircle, StatCircleContainer } from "../components/StatCircle";

const Index = () => (
  <>
    <StatCircleContainer>
      <StatCircle
        title="Servers"
        value={80_000}
        image={<Image src={serversImage} width={75} height={75} alt="Servers" />}
      />
      <StatCircle
        title="Commands Ran"
        value={45_000_000}
        image={<Image src={commandsImage} width={64} height={64} alt="Commands Ran" />}
      />
    </StatCircleContainer>
    <Feature
      title="Players"
      images={[
        <Image placeholder="blur" src={bedwarsProfile} alt="BedWars" />,
        <Image placeholder="blur" src={duelsProfile} alt="Duels" />,
        <Image placeholder="blur" src={skywarsProfile} alt="SkyWars" />,
        <Image placeholder="blur" src={arcadeProfile} alt="Arcade" />,
      ]}
      align="left"
    >
      Beautiful visuals are provided by Statsify for every game on Hypixel. Simply input{" "}
      <Code>/bedwars</Code> into Discord to see your BedWars stats or those of your
      friends. To see further games, type <Code>/</Code> followed by the name of the game.
      To quickly search for yourself, you may link your Minecraft account to your Discord
      with <Code>/verify</Code>
    </Feature>
    <Feature
      title="Leaderboards"
      images={[
        <Image
          placeholder="blur"
          src={woolwarsLeaderboard}
          alt="WoolWars Overall Wins Leaderboard"
        />,
        <Image
          placeholder="blur"
          src={bedwarsLeaderboard}
          alt="BedWars Level Leaderboard"
        />,
        <Image
          placeholder="blur"
          src={buildbattleLeaderboard}
          alt="Build Battle Score Leaderboard"
        />,
        <Image
          placeholder="blur"
          src={blitzsgLeaderboard}
          alt="BlitzSG Overall Kills Leaderboard"
        />,
      ]}
      align="right"
    >
      Using Statsify's robust leaderboard command, you can browse approximately 2,000
      leaderboards. The leaderboards may be seen using <Code>/leaderboard</Code> followed
      by the game and the stat. For instance, to display the leaderboard for WoolWars
      Wins, for instance, write{" "}
      <Code>/leaderboard woolwars leaderboard: overall wins</Code> After executing the
      command, it is possible to rapidly switch to another player or position using the
      search buttons. You can also use the buttons provided to move around the leaderboard
      and look at the other pages for that leaderboard.
    </Feature>
    <Feature
      title="Historical Stats"
      images={[
        <Image placeholder="blur" src={dailyTNTGamesProfile} alt="Daily TNT Games" />,
        <Image
          placeholder="blur"
          src={dailyMurderMysteryProfile}
          alt="Daily Murder Mystery"
        />,
      ]}
      align="left"
    >
      Using historical stats, Statsify allows you to display your stats as if you began
      playing today. There is no need to worry about your past losses, you can just focus
      on the now. To quickly obtain your daily stats, type <Code>/daily</Code> followed by
      the game of your choice. For example, enter <Code>/daily tntgames</Code> to get your
      daily TNT Games stats. The same holds true for weekly and monthly.
    </Feature>
    <Feature
      title="Guilds"
      images={[
        <Image placeholder="blur" src={guildOverallProfile} alt="Guild Overall" />,
        <Image
          placeholder="blur"
          src={guildOverallGexpProfile}
          alt="Guild Overall GEXP"
        />,
        <Image placeholder="blur" src={guildTopProfile} alt="Guild Top" />,
        <Image placeholder="blur" src={guildMemberProfile} alt="Guild Member" />,
      ]}
      align="right"
    >
      Statsify makes managing your guild easier. Simply enter <Code>/guild top</Code> to
      see the members of your guild with the most GEXP for the day, week, or month. Track
      individual guild members and their GEXP with the <Code>/guild member</Code> command.
      Use <Code>/guild leaderboard</Code> to see your guild's place on the leaderboards.
      Statsify's unique features, such as monthly GEXP, make it simple to promote and
      demote users and monitor their long-term success. Using <Code>/guild overall</Code>,
      you can quickly compare your guild against others'.
    </Feature>
    <Feature
      title="Miscellaneous"
      images={[<Image placeholder="blur" src={recentGamesProfile} alt="Recent Games" />]}
      align="left"
    >
      Statsify has a plethora of helpful Hypixel utilities. For example, you can use{" "}
      <Code>/friends</Code> to access any player's friend list or <Code>/mutuals</Code> to
      see mutual friends between players. Statsify also allows you to monitor player
      activity using <Code>/status</Code> and <Code>/recentgames</Code>. Using{" "}
      <Code>/gamecounts</Code>, you can track Hypixel's game popularity without ever
      opening minecraft.
    </Feature>
    <Feature
      title="Minecraft"
      images={[<Image placeholder="blur" src={skinEmbed} alt="Skin" />]}
      align="right"
    >
      Statsify gives options for seeing a player's overall Minecraft profile. View a
      player's skin with <Code>/skin</Code>, see a player's prior names using
      <Code>/namehistory</Code>, see a player's cape with <Code>/cape</Code>. You can even
      create your own Minecraft text with <Code>/text</Code>!
    </Feature>
    <Invite />
  </>
);

export default Index;
