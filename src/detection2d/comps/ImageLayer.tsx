import { Layer, Image } from "react-konva";
import { useCanvasContext } from "./Canvas";

type ImageLayerProps = {
    image?: HTMLCanvasElement | null;
};

export function ImageLayer({ image }: ImageLayerProps) {
    const { dimensions } = useCanvasContext();

    // Calculate scale to fit image width to container
    const imageWidth = image?.width ?? 1;
    const imageHeight = image?.height ?? 1;
    const scale = dimensions.width > 0 ? dimensions.width / imageWidth : 1;
    const scaledHeight = imageHeight * scale;

    return (
        <Layer
            scaleX={scale}
            scaleY={scale}
            x={0}
            y={(dimensions.height - scaledHeight) / 2}
        >
            {image && <Image image={image} />}
        </Layer>
    );
}
