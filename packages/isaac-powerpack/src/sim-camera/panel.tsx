import { PanelExtensionContext, Topic } from "@foxglove/extension";
import { ReactElement, useEffect, useLayoutEffect, useState } from "react";
import { createRoot } from "react-dom/client";

import { KeyboardDisplayLayer } from "./comps/KeyboardDisplay";
import { useKeyboardControl } from "./hooks/useKeyboardControl";
import { useSettingsPanel } from "./hooks/useSettingsPanel";
import { Canvas } from "../lib/comps/Canvas";

function SimCameraPanel({ context }: { context: PanelExtensionContext }): ReactElement {
  const [renderDone, setRenderDone] = useState<(() => void) | undefined>();
  const [topics, setTopics] = useState<readonly Topic[] | undefined>(() => []);
  const { state } = useSettingsPanel(context, topics);
  const { pressedKey } = useKeyboardControl(context, state);

  useLayoutEffect(() => {
    context.onRender = (renderState, done) => {
      setRenderDone(() => done);
      setTopics(renderState.topics ?? []);
    };
    context.watch("topics");
    context.watch("currentFrame");
  }, [context]);

  useEffect(() => {
    renderDone?.();
  }, [renderDone]);

  return (
    <div>
      <Canvas>
        <KeyboardDisplayLayer pressedKey={pressedKey} />
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
