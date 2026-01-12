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
}: {
  pressedKey: string | null;
}): React.ReactElement {
  const keySize = 60;
  const keySpacing = 10;
  const startX = 50;
  const startY = 50;
  const columnSpacing = 250;

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
      const rowOffset = 0; //rowIndex === 1 ? keySize / 4 : 0;
      return row.map((key, colIndex) => (
        <Key
          key={key}
          keyLabel={key}
          isPressed={pressedKey === key}
          x={offsetX + rowOffset + colIndex * (keySize + keySpacing)}
          y={startY + rowIndex * (keySize + keySpacing)}
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
      {renderKeyboard(orientationLayout, startX + columnSpacing)}
    </Layer>
  );
}
