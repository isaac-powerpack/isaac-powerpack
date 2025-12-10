import Konva from "konva";
import { useEffect, useRef } from "react";
import { Stage } from "react-konva";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { create } from "zustand";

type CanvasStore = {
  dimensions: { width: number; height: number };
  setDimensions: (dimensions: { width: number; height: number }) => void;
};

export const useCanvasStore = create<CanvasStore>((set) => ({
  dimensions: { width: 0, height: 0 },
  setDimensions: (dimensions) => {
    set({ dimensions });
  },
}));

type CanvasProps = {
  children?: React.ReactNode;
};

export function Canvas({ children }: CanvasProps): React.JSX.Element {
  const setDimensions = useCanvasStore((state) => state.setDimensions);
  const dimensions = useCanvasStore((state) => state.dimensions);
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);

  // Track container dimensions with ResizeObserver
  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

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
    return () => {
      resizeObserver.disconnect();
    };
  }, [setDimensions]);

  return (
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
          <Stage ref={stageRef} width={dimensions.width} height={dimensions.height}>
            {children}
          </Stage>
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
}
