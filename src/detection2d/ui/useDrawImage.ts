import { useEffect, useRef } from "react";
import { SensorImage, ImageMessageEvent } from "../types";


async function drawImageOnCanvas(img: SensorImage, canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height, encoding, step } = img;

    // Match canvas size to the ROS image
    canvas.width = width;
    canvas.height = height;

    // Make sure we have a Uint8Array to work with
    const src =
        img.data instanceof Uint8Array ? img.data : Uint8Array.from(img.data);

    // Prepare output buffer (RGBA for canvas)
    const imageData = ctx.createImageData(width, height);
    const dst = imageData.data; // Uint8ClampedArray length = width * height * 4

    // Determine number of channels per pixel
    let channels: number;
    switch (encoding) {
        case "mono8":
            channels = 1;
            break;
        case "rgb8":
        case "bgr8":
            channels = 3;
            break;
        case "rgba8":
        case "bgra8":
            channels = 4;
            break;
        default:
            console.warn(`Unsupported encoding: ${encoding}`);
            return;
    }

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const srcIndex = y * step + x * channels;
            const dstIndex = (y * width + x) * 4;

            let r = 0,
                g = 0,
                b = 0,
                a = 255;

            switch (encoding) {
                case "mono8": {
                    const v = src[srcIndex] || 0;
                    r = g = b = v;
                    break;
                }
                case "rgb8": {
                    r = src[srcIndex] || 0;
                    g = src[srcIndex + 1] || 0;
                    b = src[srcIndex + 2] || 0;
                    break;
                }
                case "bgr8": {
                    b = src[srcIndex] || 0;
                    g = src[srcIndex + 1] || 0;
                    r = src[srcIndex + 2] || 0;
                    break;
                }
                case "rgba8": {
                    r = src[srcIndex] || 0;
                    g = src[srcIndex + 1] || 0;
                    b = src[srcIndex + 2] || 0;
                    a = src[srcIndex + 3] || 0;
                    break;
                }
                case "bgra8": {
                    b = src[srcIndex] || 0;
                    g = src[srcIndex + 1] || 0;
                    r = src[srcIndex + 2] || 0;
                    a = src[srcIndex + 3] || 0;
                    break;
                }
            }

            dst[dstIndex] = r;
            dst[dstIndex + 1] = g;
            dst[dstIndex + 2] = b;
            dst[dstIndex + 3] = a;
        }
    }

    ctx.putImageData(imageData, 0, 0);

    // Reset any transforms if you use them elsewhere
    (ctx as any).resetTransform?.();
}

export function useDrawImage(message: ImageMessageEvent | null | undefined) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (message) {
            drawImageOnCanvas((message as any).message, canvasRef.current!).catch(
                (error: any) => console.log(error),
            );
        }
    }, [message]);
    return canvasRef;
}