import { useMemo } from "react";
import { Layer, Line, Circle, Text } from "react-konva";
import type { ImageAnnotations } from "@foxglove/schemas";
import { useCanvasStore } from "./Canvas";
import { calculateImageFit } from "../../lib/utils/images";

type BoundingBoxLayerProps = {
    image?: HTMLCanvasElement | null;
    annotations?: Partial<ImageAnnotations>;
};

export function BoundingBoxLayer({ annotations, image }: BoundingBoxLayerProps) {
    if (!annotations) {
        return null;
    }

    const dimensions = useCanvasStore((state) => state.dimensions);

    const { scale, x, y } = useMemo(() => calculateImageFit(
        dimensions,
        image
    ), [dimensions, image]);

    const { circles, points, texts } = annotations;

    return (
        <Layer scaleX={scale} scaleY={scale} x={x} y={y}>
            {points?.map((point, index) => {
                const flatPoints = point.points.flatMap((p) => [p.x, p.y]);
                const { r, g, b, a } = point.outline_color;
                const stroke = `rgba(${r * 255}, ${g * 255}, ${b * 255}, ${a})`;

                return (
                    <Line
                        key={`points-${index}`}
                        points={flatPoints}
                        stroke={stroke}
                        strokeWidth={point.thickness}
                        closed={point.type === 2} // LINE_LOOP
                    />
                );
            })}

            {circles?.map((circle, index) => {
                const { r, g, b, a } = circle.outline_color;
                const stroke = `rgba(${r * 255}, ${g * 255}, ${b * 255}, ${a})`;
                const { r: fr, g: fg, b: fb, a: fa } = circle.fill_color;
                const fill = `rgba(${fr * 255}, ${fg * 255}, ${fb * 255}, ${fa})`;

                return (
                    <Circle
                        key={`circle-${index}`}
                        x={circle.position.x}
                        y={circle.position.y}
                        radius={circle.diameter / 2}
                        stroke={stroke}
                        strokeWidth={circle.thickness}
                        fill={fill}
                    />
                );
            })}

            {texts?.map((text, index) => {
                const { r, g, b, a } = text.text_color;
                const fill = `rgba(${r * 255}, ${g * 255}, ${b * 255}, ${a})`;

                return (
                    <Text
                        key={`text-${index}`}
                        x={text.position.x}
                        y={text.position.y}
                        text={text.text}
                        fill={fill}
                        fontSize={text.font_size}
                    />
                );
            })}
        </Layer>
    );
}
