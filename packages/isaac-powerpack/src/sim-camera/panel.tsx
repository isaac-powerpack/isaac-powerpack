import { PanelExtensionContext, Topic } from "@foxglove/extension";
import { ReactElement, useEffect, useLayoutEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { useSettingsPanel } from "./hooks/useSettingsPanel";

function SimCameraPanel({ context }: { context: PanelExtensionContext }): ReactElement {
  const [renderDone, setRenderDone] = useState<(() => void) | undefined>();
  const [topics, setTopics] = useState<readonly Topic[] | undefined>(() => []);
  const [pressedKey, setPressedKey] = useState<string | null>(null);
  const { state } = useSettingsPanel(context, topics);

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

  // Advertise the publish topic
  useEffect(() => {
    if (state.data.publishTopic) {
      context.advertise?.(state.data.publishTopic, "geometry_msgs/msg/Pose");
    }

    return () => {};
  }, [context, state.data.publishTopic]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!state.data.enabled) return;

      const key = event.key.toLowerCase();
      if ("qweasduiojkl".includes(key)) {
        setPressedKey(key);
        console.info("SimCameraPanel - pressedKey:", key);

        // Publish Pose message when 'q' is pressed
        if (key === "q" && state.data.publishTopic) {
          const poseMessage = {
            position: {
              x: 0.5,
              y: 0.0,
              z: 0.0,
            },
            orientation: {
              x: 0.0,
              y: 0.0,
              z: 0.0,
              w: 1.0,
            },
          };
          context.publish?.(state.data.publishTopic, poseMessage);
          console.info("Published Pose message to", state.data.publishTopic, poseMessage);
        }
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (!state.data.enabled) return;

      const key = event.key.toLowerCase();
      if ("qweasd".includes(key)) {
        setPressedKey(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [state.data.enabled]);

  return (
    <div>
      <h1>SimCamera Panel</h1>
      <p>{topics?.length} topics</p>
      <p>isEnabled: {state.data.enabled ? "On" : "Off"}</p>
      <p>Pressed Key: {pressedKey ?? "None"}</p>
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
