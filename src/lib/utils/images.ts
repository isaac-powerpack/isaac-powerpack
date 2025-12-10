export type Dimensions = {
    width: number;
    height: number;
};

export type ImageDimensions = Partial<Dimensions> | HTMLCanvasElement | null;

export type ImageFitResult = {
    scale: number;
    x: number;
    y: number;
};

/**
 * Calculates the scale and its x,y offset position to fit an image within a container while maintaining aspect ratio.
 * The image is scaled to fit the container width and centered vertically.
 */
export function calculateImageFit(container: Dimensions, image?: ImageDimensions): ImageFitResult {
    const imageWidth = image?.width ?? 1;
    const imageHeight = image?.height ?? 1;
    const scale = container.width > 0 ? container.width / imageWidth : 1;
    const scaledHeight = imageHeight * scale;

    return {
        scale,
        x: 0,
        y: (container.height - scaledHeight) / 2,
    };
}
