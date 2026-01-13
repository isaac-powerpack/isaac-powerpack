import { Group, Rect, Text } from "react-konva";

interface KeyProps {
  keyLabel: string;
  isPressed: boolean;
  x: number;
  y: number;
  size: number;
  isShowDesc: boolean;
  desc?: string;
  descPosition?: "top" | "bottom";
}

export function Key({
  keyLabel,
  isPressed,
  desc,
  x,
  y,
  size,
  descPosition,
  isShowDesc,
}: KeyProps): React.ReactElement {
  const fontSize = size * 0.5; // 50% of key size
  const descriptionFontSize = size * 0.2; // 20% of key size
  const cornerRadius = size * 0.167; // ~10px at 60px size

  const descriptionY = descPosition === "top" ? -(descriptionFontSize + 10) : size + 10;
  const descriptionWidth = size * 1.33; // ~80px at 60px size
  const descriptionX = -(descriptionWidth - size) / 2;

  return (
    <Group x={x} y={y}>
      <Rect
        width={size}
        height={size}
        cornerRadius={cornerRadius}
        fill={isPressed ? "#4CAF50" : "#ffffff"}
        stroke={isPressed ? "#2E7D32" : "#000000"}
        strokeWidth={isPressed ? 3 : 2}
      />
      <Text
        text={keyLabel.toUpperCase()}
        fontSize={fontSize}
        fontStyle="bold"
        fill={isPressed ? "#ffffff" : "#000000"}
        width={size}
        height={size}
        align="center"
        verticalAlign="middle"
      />
      {isShowDesc && desc && (
        <Text
          text={desc}
          fontSize={descriptionFontSize}
          fill="#00000070"
          width={descriptionWidth}
          align="center"
          y={descriptionY}
          x={descriptionX}
        />
      )}
    </Group>
  );
}
