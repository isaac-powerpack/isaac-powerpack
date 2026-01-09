import { PanelExtensionContext } from "@foxglove/extension";
import { useEffect, useRef, useState } from "react";

import { PanelState } from "./useSettingsPanel";

export function useKeyboardControl(
  context: PanelExtensionContext,
  state: PanelState,
): {
  pressedKey: string | null;
} {
  const [pressedKey, setPressedKey] = useState<string | null>(null);
  const prevTopic = useRef<string | undefined>();

  // Advertise the publish topic
  useEffect(() => {
    const isTopicChanged = prevTopic.current !== state.data.cameraControlTopic;

    // Unadvertise previous topic if it changed
    if (isTopicChanged && prevTopic.current) {
      context.unadvertise?.(prevTopic.current);
    }

    // Advertise new topic
    if (state.data.cameraControlTopic) {
      context.advertise?.(state.data.cameraControlTopic, "geometry_msgs/msg/Pose");
      prevTopic.current = state.data.cameraControlTopic;
    }

    return () => {
      if (state.data.cameraControlTopic) {
        context.unadvertise?.(state.data.cameraControlTopic);
      }
    };
  }, [context, state.data.cameraControlTopic]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!state.data.enabled) return;

      const key = event.key.toLowerCase();
      if (!"qweasduiojkl".includes(key)) return;

      setPressedKey(key);

      // Publish Pose message when 'q' is pressed
      if (key === "q" && state.data.cameraControlTopic) {
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
        context.publish?.(state.data.cameraControlTopic, poseMessage);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (!state.data.enabled) return;

      const key = event.key.toLowerCase();
      if ("qweasduiojkl".includes(key)) {
        setPressedKey(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [state.data.enabled, state.data.cameraControlTopic]);
  return {
    pressedKey,
  };
}
