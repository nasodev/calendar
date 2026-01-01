interface EventCardProps {
  title: string;
  time?: string;
  memberColor: string;
  categoryColor?: string;
  memberName: string;
  onClick?: (e: React.MouseEvent) => void;
}

export function EventCard({
  title,
  time,
  memberColor,
  categoryColor,
  memberName,
  onClick,
}: EventCardProps) {
  return (
    <div
      onClick={onClick}
      className="flex items-start gap-1 p-1 rounded text-xs cursor-pointer hover:opacity-80 transition-opacity"
      style={{
        backgroundColor: `${memberColor}15`,
      }}
    >
      {categoryColor && (
        <span
          className="w-2 h-2 rounded-full mt-0.5 flex-shrink-0"
          style={{ backgroundColor: categoryColor }}
        />
      )}
      <div className="min-w-0 flex-1">
        <p className="font-medium truncate">{title}</p>
        {time && <p className="text-muted-foreground">{time}</p>}
        <p className="text-muted-foreground truncate">{memberName}</p>
      </div>
    </div>
  );
}
