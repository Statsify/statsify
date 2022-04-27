import { JSX } from '@statsify/jsx';

export interface HeaderNametagProps {
  name: string;
}

export const HeaderNametag: JSX.FC<HeaderNametagProps> = ({ name }) => {
  return (
    <box width="100%">
      <text>§^4^{name}</text>
    </box>
  );
};
