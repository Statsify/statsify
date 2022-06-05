export interface HeaderBodyProps {
  description?: string;
  title: string;
}

export const HeaderBody = ({ description, title }: HeaderBodyProps) => {
  if (!description) {
    return (
      <box width="remaining" height="remaining">
        <text>{title}</text>
      </box>
    );
  }

  return (
    <div direction="column" width="remaining" height="remaining">
      <box
        width="100%"
        direction="column"
        height="remaining"
        padding={{ bottom: 5, left: 10, right: 10, top: 5 }}
      >
        {description.split('\n').map((t) => (
          <text margin={1}>{t}</text>
        ))}
      </box>
      <box width="100%">
        <text>{title}</text>
      </box>
    </div>
  );
};
