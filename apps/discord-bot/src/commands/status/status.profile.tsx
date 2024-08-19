/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Container, Footer, Header, If, Multiline, Table } from "#components";
import { FormattedGame, type GameId, type RecentGame, type Status } from "@statsify/schemas";
import { arrayGroup, prettify, relativeTime } from "@statsify/util";
import { mapGame } from "#constants";
import type { BaseProfileProps } from "#commands/base.hypixel-command";
import type { Image } from "skia-canvas";
import type { LocalizeFunction } from "@statsify/discord";

interface StatusTableProps {
  status: Status;
  t: LocalizeFunction;
}

const OnlineTable = ({ status, t }: StatusTableProps) => (
  <>
    <Table.tr>
      <Table.td title={t("stats.status")} value={t("stats.online")} color="§a" />
      <Table.td title={t("stats.version")} value={status.actions.version} color="§b" />
      <Table.td
        title={t("stats.loginTime")}
        value={relativeTime(status.actions.lastLogin)}
        color="§b"
      />
    </Table.tr>
    <Table.tr>
      <Table.td
        title={t("stats.game")}
        value={FormattedGame[status.game.id]}
        color="§e"
      />
      <If condition={status.mode}>
        {(mode) => (
          <Table.td
            title={t("stats.mode")}
            value={mapGame(status.game.id, mode)}
            color="§e"
          />
        )}
      </If>
      <If condition={status.map}>
        {(map) => <Table.td title={t("stats.map")} value={map} color="§e" />}
      </If>
    </Table.tr>
    <Table.tr>
      <Table.td
        title={t("stats.lastAction")}
        value={prettify(status.actions.lastAction)}
        color="§a"
      />
      <Table.td
        title={t("stats.lastActionTime")}
        value={relativeTime(status.actions.lastActionTime)}
        color="§a"
      />
    </Table.tr>
  </>
);

const OfflineTable = ({ status, t }: StatusTableProps) => (
  <>
    <Table.tr>
      <Table.td title={t("stats.status")} value={t("stats.offline")} color="§c" />
    </Table.tr>
    <Table.tr>
      <Table.td
        title={t("stats.lastGame")}
        value={FormattedGame[status.actions.lastGame.id]}
        color="§a"
      />
      <Table.td
        title={t("stats.logoutTime")}
        value={relativeTime(status.actions.lastLogout)}
        color="§a"
      />
    </Table.tr>
  </>
);

const HiddenTable = ({ status, t }: StatusTableProps) => (
  <>
    <Table.tr>
      <Table.td title={t("stats.status")} value={t("stats.hidden")} color="§4" />
    </Table.tr>
    <Table.tr>
      <Table.td
        title={t("stats.lastAction")}
        value={prettify(status.actions.lastAction)}
        color="§a"
      />
      <Table.td
        title={t("stats.lastActionTime")}
        value={relativeTime(status.actions.lastActionTime)}
        color="§a"
      />
    </Table.tr>
  </>
);

interface RecentGamesTableProps {
  recentGames: RecentGame[];
  gameIcons: Record<GameId, Image>;
  t: LocalizeFunction;
}

const RecentGamesTable = ({ recentGames, t, gameIcons }: RecentGamesTableProps) => {
  const groups = arrayGroup(recentGames, 3);

  return (
    <>
      {groups.map((games) => (
        <Table.tr>
          {games.map(({ game, mode, map, startedAt, endedAt }) => (
            <box width="100%">
              <div width="remaining" direction="column" margin={4}>
                <text align="left" margin={2}>
                  §l{FormattedGame[game.id]}
                </text>
                <Multiline align="left" margin={2}>
                  {[
                    `§7${t("stats.mode")}: §f${mode ? mapGame(game.id, mode) : "N/A"}`,
                    `§7${t("stats.map")}: §f${map ?? "N/A"}`,
                    `§7${t("stats.started")}: §f${relativeTime(startedAt)}`,
                    `§7${t("stats.ended")}: §f${
                      endedAt ? relativeTime(endedAt) : "N/A"
                    }`,
                  ].join("\n")}
                </Multiline>
              </div>
              <If condition={gameIcons[game.id]}>
                {(icon) => (
                  <div location="left" margin={{ top: 8, right: 4 }}>
                    <img image={icon} width={32} height={32} />
                  </div>
                )}
              </If>
            </box>
          ))}
        </Table.tr>
      ))}
    </>
  );
};

export interface StatusProfileProps extends Omit<BaseProfileProps, "player" | "time"> {
  status: Status;
  gameIcons: Record<GameId, Image>;
}

export const StatusProfile = ({
  status,
  gameIcons,
  skin,
  badge,
  background,
  logo,
  user,
  t,
}: StatusProfileProps) => {
  let table: JSX.Element;

  if (status.actions.statusHidden) {
    table = <HiddenTable status={status} t={t} />;
  } else if (status.online) {
    table = <OnlineTable status={status} t={t} />;
  } else {
    table = <OfflineTable status={status} t={t} />;
  }

  return (
    <Container background={background}>
      <Header
        name={status.prefixName}
        skin={skin}
        badge={badge}
        title="§l§6Player Status"
        time="LIVE"
      />
      <Table.table>
        <If condition={status.recentGames.length > 0}>
          <Table.ts title="§6Status">
            {table}
          </Table.ts>
          <Table.ts title="§6Recent Games">
            <RecentGamesTable recentGames={status.recentGames} gameIcons={gameIcons} t={t} />
          </Table.ts>
        </If>
        <If condition={status.recentGames.length === 0}>
          {table}
        </If>
      </Table.table>
      <Footer logo={logo} user={user} />
    </Container>
  );
};
