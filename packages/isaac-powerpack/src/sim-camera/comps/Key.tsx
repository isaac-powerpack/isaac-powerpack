import { Group, Rect, Text } from "react-konva";

export type Styles = {
  key: {
    default: {
      fill: string;
      stroke: string;
      strokeWidth: number;
    };
    pressed: {
      fill: string;
      stroke: string;
      strokeWidth: number;
    };
  };
  text: {
    default: string;
    pressed: string;
    description: string;
  };
};

interface KeyProps {
  keyLabel: string;
  isPressed: boolean;
  x: number;
  y: number;
  size: number;
  isShowDesc: boolean;
  desc?: string;
  descPosition?: "top" | "bottom";
  theme?: "light" | "dark";
}

// Default styles to Light theme
export const palette = (theme: "light" | "dark"): Styles => ({
  key: {
    default: {
      fill: theme === "dark" ? "#2a2a2a" : "#ffffff",
      stroke: theme === "dark" ? "#555555" : "#000000",
      strokeWidth: 2,
    },
    pressed: {
      fill: theme === "dark" ? "#7B68EE" : "#8B7FEE",
      stroke: theme === "dark" ? "#5B3FD4" : "#5B3FD4",
      strokeWidth: 3,
    },
  },
  text: {
    default: theme === "dark" ? "#e0e0e0" : "#000000",
    pressed: "#ffffff",
    description: theme === "dark" ? "#888888" : "#00000070",
  },
});

export function Key({
  keyLabel,
  isPressed,
  desc,
  x,
  y,
  size,
  descPosition,
  isShowDesc,
  theme = "light",
}: KeyProps): React.ReactElement {
  const fontSize = size * 0.5; // 50% of key size
  const descriptionFontSize = size * 0.2; // 20% of key size
  const cornerRadius = size * 0.167; // ~10px at 60px size

  const descriptionY = descPosition === "top" ? -(descriptionFontSize + 10) : size + 10;
  const descriptionWidth = size * 1.33; // ~80px at 60px size
  const descriptionX = -(descriptionWidth - size) / 2;

  const keyStyle = isPressed ? palette(theme).key.pressed : palette(theme).key.default;
  const textColor = isPressed ? palette(theme).text.pressed : palette(theme).text.default;

  return (
    <Group x={x} y={y}>
      <Rect
        width={size}
        height={size}
        cornerRadius={cornerRadius}
        fill={keyStyle.fill}
        stroke={keyStyle.stroke}
        strokeWidth={keyStyle.strokeWidth}
      />
      <Text
        text={keyLabel.toUpperCase()}
        fontSize={fontSize}
        fontStyle="bold"
        fill={textColor}
        width={size}
        height={size}
        align="center"
        verticalAlign="middle"
      />
      {isShowDesc && desc && (
        <Text
          text={desc}
          fontSize={descriptionFontSize}
          fill={palette(theme).text.description}
          width={descriptionWidth}
          align="center"
          y={descriptionY}
          x={descriptionX}
        />
      )}
    </Group>
  );
}
