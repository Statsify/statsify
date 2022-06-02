import { Container, Footer, Header, If, Table } from '#components';
import { JSX } from '@statsify/rendering';
import { Guild, PlayerStatus } from '@statsify/schemas';
import { formatTime } from '@statsify/util';
import { BaseProfileProps } from './base.profile';

interface GeneralProfileHeaderBodyProps {
  guild?: Guild;
  status: PlayerStatus;
}

const GeneralProfileHeaderBody: JSX.FC<GeneralProfileHeaderBodyProps> = ({ guild, status }) => {
  const online = status.online ? '§aOnline' : '§cOffline';
  const firstLogin = `§7First Login: §3${formatTime(status.firstLogin)}`;
  const lastLogin = `§7Last Login: §3${status.lastLogin ? formatTime(status.lastLogout) : 'N/A'}`;

  return (
    <div height="remaining" width="remaining" direction="row">
      <div width="remaining" height="100%" direction="column">
        <box width="100%" height="50%">
          <text>§7Guild: §2{guild?.name ? guild.name : 'N/A'}</text>
        </box>
        <box width="100%" height="50%">
          <text>§7Status: {online}</text>
        </box>
      </div>
      <box height="100%" direction="column">
        <text align="left">{firstLogin}</text>
        <text align="left">{lastLogin}</text>
      </box>
    </div>
  );
};

export interface GeneralProfileProps extends BaseProfileProps {
  guild?: Guild;
  friends?: number;
}

export const GeneralProfile: JSX.FC<GeneralProfileProps> = ({
  background,
  logo,
  player,
  skin,
  t,
  badge,
  premium,
  guild,
  friends = 0,
}) => {
  const { general } = player.stats;
  const { status } = player;
  const member = guild?.members.find((m) => m.uuid === player.uuid);

  return (
    <Container background={background}>
      <Header
        name={`${player.displayName}§^2^${guild?.tag ? ` ${guild.tagFormatted}` : ''}`}
        skin={skin}
        badge={badge}
        size={3}
      >
        <GeneralProfileHeaderBody guild={guild} status={status} />
      </Header>
      <Table.table>
        <Table.tr>
          <Table.td title={t('stats.networkLevel')} value={t(general.networkLevel)} color="§6" />
          <Table.td
            title={t('stats.achievementPoints')}
            value={t(general.achievementPoints)}
            color="§6"
          />
        </Table.tr>
        <Table.tr>
          <Table.td title={t('stats.quests')} value={t(general.quests)} color="§a" />
          <Table.td title={t('stats.challenges')} value={t(general.challenges)} color="§a" />
        </Table.tr>
        <Table.tr>
          <Table.td title={t('stats.karma')} value={t(general.karma)} color="§d" />
          <Table.td title={t('stats.friends')} value={t(friends)} color="§d" />
          <Table.td title={t('stats.giftsSent')} value={t(general.giftsSent)} color="§5" />
          <Table.td title={t('stats.ranksGifted')} value={t(general.ranksGifts)} color="§5" />
        </Table.tr>
        <If condition={member}>
          {(member) => (
            <Table.tr>
              <Table.td
                title={t('stats.guildQuests')}
                value={t(member.questParticipation)}
                color="§2"
              />
              <Table.td title={t('stats.dailyGexp')} value={t(member.daily)} color="§2" />
              <Table.td title={t('stats.weeklyGexp')} value={t(member.weekly)} color="§2" />
            </Table.tr>
          )}
        </If>
      </Table.table>
      <Footer logo={logo} premium={premium} />
    </Container>
  );
};
