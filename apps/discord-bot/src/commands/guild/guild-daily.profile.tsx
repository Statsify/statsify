import { Container } from '#components';
import { LocalizeFunction } from '@statsify/discord';
import { Guild } from '@statsify/schemas';
import { Image } from 'skia-canvas/lib';

export interface GuildDailyProfileProps {
  guild: Guild;
  t: LocalizeFunction;
  background: Image;
}

export const GuildDailyProfile = ({ guild, t, background }: GuildDailyProfileProps) => {
  const members = guild.members.sort((a, b) => b.daily - a.daily).slice(0, 30);

  return (
    <Container background={background}>
      <box width="100%">
        <text>§^4^{guild.nameFormatted}</text>
      </box>
      <box width="100%">
        <text>§l§2Guild Daily GEXP</text>
      </box>
      <div width="100%" direction="column">
        {members.map((member, index) => (
          <div width="100%">
            <box border={{ bottomLeft: 4, topLeft: 4, bottomRight: 0, topRight: 0 }}>
              <text>#§l{t(index + 1)}</text>
            </box>
            <box
              width="remaining"
              border={{ bottomLeft: 0, topLeft: 0, bottomRight: 0, topRight: 0 }}
            >
              <text>{member.displayName}</text>
            </box>
            <box
              padding={{ left: 4, right: 4 }}
              border={{ bottomLeft: 0, topLeft: 0, bottomRight: 4, topRight: 4 }}
            >
              <text>{t(member.daily)}</text>
            </box>
          </div>
        ))}
      </div>
    </Container>
  );
};
