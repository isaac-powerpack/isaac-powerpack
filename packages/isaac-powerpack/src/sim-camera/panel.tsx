import { PanelExtensionContext, Topic } from "@foxglove/extension";
import { ReactElement, useEffect, useLayoutEffect, useState } from "react";
import { createRoot } from "react-dom/client";

import { KeyboardDisplayLayer } from "./comps/KeyboardDisplay";
import { StatusBadge } from "./comps/StatusBadge";
import { useKeyboardControl } from "./hooks/useKeyboardControl";
import { useSettingsPanel } from "./hooks/useSettingsPanel";
import { Canvas, useCanvasStore } from "../lib/comps/Canvas";

function SimCameraPanel({ context }: { context: PanelExtensionContext }): ReactElement {
  const [renderDone, setRenderDone] = useState<(() => void) | undefined>();
  const [topics, setTopics] = useState<readonly Topic[] | undefined>(() => []);
  const { state } = useSettingsPanel(context, topics);
  const { pressedKeys } = useKeyboardControl(context, state);
  const canvasWidth = useCanvasStore((canvasState) => canvasState.dimensions.width);
  const canvasHeight = useCanvasStore((canvasState) => canvasState.dimensions.height);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useLayoutEffect(() => {
    context.watch("colorScheme");
    context.watch("topics");
    context.watch("currentFrame");

    context.onRender = (renderState, done) => {
      setRenderDone(() => done);
      setTopics(renderState.topics ?? []);
      setTheme(renderState.colorScheme === "dark" ? "dark" : "light");
    };
  }, [context]);

  useEffect(() => {
    renderDone?.();
  }, [renderDone]);

  return (
    <div
      style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}
    >
      <StatusBadge isEnabled={state.data.enabled} theme={theme} />
      <Canvas>
        <KeyboardDisplayLayer
          theme={theme}
          pressedKeys={pressedKeys}
          width={canvasWidth}
          height={canvasHeight}
          isShowDesc={state.display.showDesc}
          isEnabled={state.data.enabled}
        />
      </Canvas>
    </div>
  );
}

export function initSimCameraPanel(context: PanelExtensionContext): () => void {
  const root = createRoot(context.panelElement);
  root.render(<SimCameraPanel context={context} />);

  return () => {
    root.unmount();
  };
}
