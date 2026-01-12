import { Group, Rect, Text } from "react-konva";

interface KeyProps {
  keyLabel: string;
  isPressed: boolean;
  x: number;
  y: number;
  description?: string;
}

export function Key({ keyLabel, isPressed, description, x, y }: KeyProps): React.ReactElement {
  return (
    <Group x={x} y={y}>
      <Rect
        width={60}
        height={60}
        cornerRadius={10}
        fill={isPressed ? "#4CAF50" : "#ffffff"}
        stroke={isPressed ? "#2E7D32" : "#000000"}
        strokeWidth={isPressed ? 3 : 2}
      />
      <Text
        text={keyLabel.toUpperCase()}
        fontSize={30}
        fontStyle="bold"
        fill={isPressed ? "#ffffff" : "#000000"}
        width={60}
        height={60}
        align="center"
        verticalAlign="middle"
      />
      {description && (
        <Text
          text={description}
          fontSize={6}
          fill="#000000"
          width={80}
          align="center"
          y={70}
          x={-10}
        />
      )}
    </Group>
  );
}
