import { Color, ImageAnnotations, PointsAnnotationType } from "@foxglove/schemas";
import { useMemo } from "react";
import { Layer, Line, Circle, Label, Tag, Text } from "react-konva";

import { useCanvasStore } from "./Canvas";
import { calculateImageFit } from "../../lib/utils/images";

type BoundingBoxLayerProps = {
  isShow?: boolean;
  image?: HTMLCanvasElement | null;
  annotations?: Partial<ImageAnnotations>;
};

function toRgba({ r, g, b, a }: Color): string {
  return `rgba(${r * 255}, ${g * 255}, ${b * 255}, ${a})`;
}

export function BoundingBoxLayer({
  annotations,
  image,
  isShow,
}: BoundingBoxLayerProps): React.JSX.Element | null {
  const dimensions = useCanvasStore((state) => state.dimensions);

  const { scale, x, y } = useMemo(() => calculateImageFit(dimensions, image), [dimensions, image]);

  if (annotations == undefined || isShow !== true) {
    return null;
  }

  const { circles, points, texts } = annotations;

  return (
    <Layer scaleX={scale} scaleY={scale} x={x} y={y}>
      {points?.map((point, index) => (
        <Line
          key={`points-${index}`}
          points={point.points.flatMap((p) => [p.x, p.y])}
          stroke={toRgba(point.outline_color)}
          strokeWidth={point.thickness}
          closed={point.type === PointsAnnotationType.LINE_LOOP}
        />
      ))}

      {circles?.map((circle, index) => (
        <Circle
          key={`circle-${index}`}
          x={circle.position.x}
          y={circle.position.y}
          radius={circle.diameter / 2}
          stroke={toRgba(circle.outline_color)}
          strokeWidth={circle.thickness}
          fill={toRgba(circle.fill_color)}
        />
      ))}

      {texts?.map((text, index) => (
        <Label key={`text-${index}`} x={text.position.x} y={text.position.y}>
          <Tag fill={toRgba(text.background_color)} />
          <Text
            text={text.text}
            fill={toRgba(text.text_color)}
            fontSize={text.font_size}
            padding={2}
          />
        </Label>
      ))}
    </Layer>
  );
}
