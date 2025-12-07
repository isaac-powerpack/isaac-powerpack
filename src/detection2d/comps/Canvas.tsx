import { createContext, useContext, useEffect, useRef, useState } from "react";
import { Stage } from "react-konva";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import Konva from "konva";

type CanvasContextValue = {
    dimensions: { width: number; height: number };
};

const CanvasContext = createContext<CanvasContextValue | null>(null);

export function useCanvasContext() {
    const context = useContext(CanvasContext);
    if (!context) {
        throw new Error("useCanvasContext must be used within a Canvas");
    }
    return context;
}

type CanvasProps = {
    children?: React.ReactNode;
};

export function Canvas({ children }: CanvasProps) {
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const containerRef = useRef<HTMLDivElement>(null);
    const stageRef = useRef<Konva.Stage>(null);

    // Track container dimensions with ResizeObserver
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        setDimensions({
            width: container.clientWidth,
            height: container.clientHeight,
        });

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const { width, height } = entry.contentRect;
                if (width > 0 && height > 0) {
                    setDimensions({ width, height });
                }
            }
        });

        resizeObserver.observe(container);
        return () => resizeObserver.disconnect();
    }, []);

    return (
        <CanvasContext.Provider value={{ dimensions }}>
            <div
                ref={containerRef}
                style={{
                    width: "100%",
                    height: "100%",
                    overflow: "hidden",
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                }}
            >
                <TransformWrapper
                    initialScale={1}
                    minScale={0.1}
                    maxScale={10}
                    centerOnInit
                    doubleClick={{ mode: "reset" }}
                >
                    <TransformComponent
                        wrapperStyle={{ width: "100%", height: "100%" }}
                        contentStyle={{ width: "100%", height: "100%" }}
                    >
                        <Stage
                            ref={stageRef}
                            width={dimensions.width}
                            height={dimensions.height}
                        >
                            {children}
                        </Stage>
                    </TransformComponent>
                </TransformWrapper>
            </div>
        </CanvasContext.Provider>
    );
}
