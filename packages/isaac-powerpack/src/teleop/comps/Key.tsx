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
    disabled: {
      fill: string;
      stroke: string;
      strokeWidth: number;
    };
  };
  text: {
    default: string;
    pressed: string;
    description: string;
    disabled: string;
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
  isEnabled?: boolean;
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
    disabled: {
      fill: theme === "dark" ? "#1a1a1a" : "#f5f5f5",
      stroke: theme === "dark" ? "#3a3a3a" : "#cccccc",
      strokeWidth: 1,
    },
  },
  text: {
    default: theme === "dark" ? "#e0e0e0" : "#000000",
    pressed: "#ffffff",
    description: theme === "dark" ? "#888888" : "#00000070",
    disabled: theme === "dark" ? "#4a4a4a" : "#a0a0a0",
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
  isEnabled = true,
}: KeyProps): React.ReactElement {
  // responsive size calculations
  const fontSize = size * 0.5; // 50% of key size
  const descriptionFontSize = size * 0.2; // 20% of key size
  const cornerRadius = size * 0.167; // ~10px at 60px size

  const descriptionY = descPosition === "top" ? -(descriptionFontSize + 10) : size + 10;
  const descriptionWidth = size * 1.33; // ~80px at 60px size
  const descriptionX = -(descriptionWidth - size) / 2;

  // styling
  const keyState = !isEnabled ? "disabled" : isPressed ? "pressed" : "default";
  const keyStyle = palette(theme).key[keyState];
  const textColor = palette(theme).text[keyState];

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
          fill={!isEnabled ? palette(theme).text.disabled : palette(theme).text.description}
          width={descriptionWidth}
          align="center"
          y={descriptionY}
          x={descriptionX}
        />
      )}
    </Group>
  );
}
