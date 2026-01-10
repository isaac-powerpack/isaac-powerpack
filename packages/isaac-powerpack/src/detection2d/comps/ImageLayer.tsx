import { useMemo } from "react";
import { Layer, Image } from "react-konva";

import { useCanvasStore } from "../../lib/comps/Canvas";
import { calculateImageFit } from "../../lib/utils/images";

type ImageLayerProps = {
  image?: HTMLCanvasElement | null;
};

export function ImageLayer({ image }: ImageLayerProps): React.JSX.Element {
  const dimensions = useCanvasStore((state) => state.dimensions);

  const { scale, x, y } = useMemo(() => calculateImageFit(dimensions, image), [dimensions, image]);

  return (
    <Layer scaleX={scale} scaleY={scale} x={x} y={y}>
      {image && <Image image={image} />}
    </Layer>
  );
}
