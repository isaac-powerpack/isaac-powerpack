import { Layer } from "react-konva";

import { Key } from "./Key";

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

export function KeyboardDisplayLayer({
  pressedKey,
  width,
  height,
}: {
  pressedKey: string | null;
  width: number;
  height: number;
}): React.ReactElement {
  // Scale based on available width - aim for ~70% of width for 2 columns
  const scale = Math.min(width / 600, 1.5); // Max scale of 1.5x
  const keySize = 60 * scale;
  const keySpacing = 10 * scale;
  const columnSpacing = 50 * scale;

  // Calculate total layout dimensions
  const columnWidth = 3 * keySize + 2 * keySpacing; // 3 keys with 2 gaps
  const totalLayoutHeight = 2 * keySize + keySpacing; // 2 rows with 1 gap

  // Center the layout horizontally and vertically
  const startX = width / 2 - columnWidth - columnSpacing / 2; //Math.max((width - totalLayoutWidth) / 2, 20) + 10;
  const startY = Math.max((height - totalLayoutHeight) / 2, 20);

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
          isPressed={pressedKey === key}
          x={offsetX + rowOffset + colIndex * (keySize + keySpacing)}
          y={startY + rowIndex * (keySize + keySpacing)}
          size={keySize}
          description={keyDescription[key] ?? undefined}
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
    </Layer>
  );
}
