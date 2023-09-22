/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Container, Footer, Header, If, Table } from "#components";
import { FormattedGame, Status } from "@statsify/schemas";
import { LocalizeFunction } from "@statsify/discord";
import { mapGame } from "#constants";
import { prettify, relativeTime } from "@statsify/util";
import type { BaseProfileProps } from "#commands/base.hypixel-command";

interface StatusTableProps {
  status: Status;
  t: LocalizeFunction;
}

const OnlineTable = ({ status, t }: StatusTableProps) => (
  <Table.table>
    <Table.table>
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
    </Table.table>
  </Table.table>
);

const OfflineTable = ({ status, t }: StatusTableProps) => (
  <Table.table>
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
  </Table.table>
);

const HiddenTable = ({ status, t }: StatusTableProps) => (
  <Table.table>
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
  </Table.table>
);

export interface StatusProfileProps extends Omit<BaseProfileProps, "player" | "time"> {
  status: Status;
}

export const StatusProfile = ({
  status,
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
      {table}
      <Footer logo={logo} user={user} />
    </Container>
  );
};
