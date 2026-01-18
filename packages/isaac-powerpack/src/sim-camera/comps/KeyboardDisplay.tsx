import { Layer, Text } from "react-konva";

import { Key, palette as keyPalette } from "./Key";

const keyDescription: Record<string, string> = {
  // Position keys
  w: "Forward",
  s: "Backward",
  a: "Left",
  d: "Right",
  q: "Up",
  e: "Down",
  // Orientation keys
  u: "Roll Left",
  o: "Roll Right",
  i: "Pitch Up",
  k: "Pitch Down",
  j: "Yaw Left",
  l: "Yaw Right",
};

interface KeyboardDisplayLayerProps {
  theme: "light" | "dark";
  pressedKeys: Set<string> | null;
  width: number;
  height: number;
  isShowDesc?: boolean;
}

export function KeyboardDisplayLayer({
  theme,
  pressedKeys,
  width,
  height,
  isShowDesc = true,
}: KeyboardDisplayLayerProps): React.ReactElement {
  // Scale based on available width - aim for ~70% of width for 2 columns
  const scale = Math.min(width / 600, 1.5); // Max scale of 1.5x
  const keySize = 60 * scale;
  const keySpacing = 10 * scale;
  const columnSpacing = 50 * scale;

  // Calculate total layout dimensions
  const columnWidth = 3 * keySize + 2 * keySpacing; // 3 keys with 2 gaps

  // Center the layout horizontally and vertically
  const startX = width / 2 - columnWidth - columnSpacing / 2;
  const startY = height / 2 - keySize;
  // Define keyboard layout for position keys (Q W E / A S D)
  const positionLayout = [
    ["q", "w", "e"],
    ["a", "s", "d"],
  ];

  // Define keyboard layout for orientation keys (U I O / J K L)
  const orientationLayout = [
    ["u", "i", "o"],
    ["j", "k", "l"],
  ];

  const renderKeyboard = (layout: string[][], offsetX: number) => {
    return layout.map((row, rowIndex) => {
      const rowOffset = 0;
      return row.map((key, colIndex) => (
        <Key
          key={key}
          keyLabel={key}
          isPressed={pressedKeys?.has(key) ?? false}
          x={offsetX + rowOffset + colIndex * (keySize + keySpacing)}
          y={startY + rowIndex * (keySize + keySpacing)}
          size={keySize}
          desc={keyDescription[key] ?? undefined}
          descPosition={rowIndex === 0 ? "top" : "bottom"}
          isShowDesc={isShowDesc}
          theme={theme}
        />
      ));
    });
  };

  return (
    <Layer>
      {/* Position keys - First column */}
      {renderKeyboard(positionLayout, startX)}

      {/* Orientation keys - Second column */}
      {renderKeyboard(orientationLayout, startX + columnWidth + columnSpacing)}

      {isShowDesc && (
        <>
          <Text
            text={"Position Control".toUpperCase()}
            fontSize={14 * scale}
            fill={keyPalette(theme).text.description}
            width={columnWidth}
            align="center"
            y={startY - 54 * scale}
            x={startX}
          />
          <Text
            text={"Orientation Control".toUpperCase()}
            fontSize={14 * scale}
            fill={keyPalette(theme).text.description}
            width={columnWidth}
            align="center"
            y={startY - 54 * scale}
            x={startX + columnWidth + columnSpacing}
          />
        </>
      )}
    </Layer>
  );
}
