import { useEffect, useRef } from "react";
import { SensorImage, ImageMessageEvent } from "../types";

type RGBA = [r: number, g: number, b: number, a: number];
type DecodeFunc = (src: Uint8Array, i: number) => RGBA;
type EncodingConfig = { channels: number; decode: DecodeFunc };

const pixel = (src: Uint8Array, i: number) => src[i] ?? 0;

const ENCODINGS: Record<string, EncodingConfig> = {
    mono8: {
        channels: 1,
        decode: (src, i) => {
            const v = pixel(src, i);
            return [v, v, v, 255];
        },
    },
    rgb8: {
        channels: 3,
        decode: (src, i) => [pixel(src, i), pixel(src, i + 1), pixel(src, i + 2), 255],
    },
    bgr8: {
        channels: 3,
        decode: (src, i) => [pixel(src, i + 2), pixel(src, i + 1), pixel(src, i), 255],
    },
    rgba8: {
        channels: 4,
        decode: (src, i) => [pixel(src, i), pixel(src, i + 1), pixel(src, i + 2), pixel(src, i + 3)],
    },
    bgra8: {
        channels: 4,
        decode: (src, i) => [pixel(src, i + 2), pixel(src, i + 1), pixel(src, i), pixel(src, i + 3)],
    },
};

function drawImageOnCanvas(img: SensorImage, canvas: HTMLCanvasElement): void {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height, encoding, step } = img;
    const config = ENCODINGS[encoding];

    if (!config) {
        console.warn(`Unsupported encoding: ${encoding}`);
        return;
    }

    canvas.width = width;
    canvas.height = height;

    const src = img.data instanceof Uint8Array ? img.data : Uint8Array.from(img.data);
    const imageData = ctx.createImageData(width, height);
    const dst = imageData.data;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const srcIndex = y * step + x * config.channels;
            const dstIndex = (y * width + x) * 4;
            const [r, g, b, a] = config.decode(src, srcIndex);

            dst[dstIndex] = r;
            dst[dstIndex + 1] = g;
            dst[dstIndex + 2] = b;
            dst[dstIndex + 3] = a;
        }
    }

    ctx.putImageData(imageData, 0, 0);
}

export function useRenderImage(message: ImageMessageEvent | undefined) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!message || !canvasRef.current) return;
        drawImageOnCanvas((message as any).message, canvasRef.current);
    }, [message]);

    return canvasRef;
}