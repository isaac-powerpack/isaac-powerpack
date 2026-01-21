import { PanelExtensionContext } from "@foxglove/extension";
import { useEffect, useMemo, useRef, useState } from "react";

import { PanelState } from "./useSettingsPanel";

export function useKeyboardControl(
  context: PanelExtensionContext,
  state: PanelState,
): {
  pressedKeys: Set<string>;
} {
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(() => new Set());
  const prevTopic = useRef<string | undefined>();
  const prevPressedKeysSize = useRef<number>(0);

  // meters per second
  const linearSpeed = useMemo(() => state.data.linearSpeedMeter, [state.data.linearSpeedMeter]);

  // radians per second
  const angularSpeed = useMemo(() => state.data.angularSpeedRad, [state.data.angularSpeedRad]);

  // Advertise the publish topic
  useEffect(() => {
    const isTopicChanged = prevTopic.current !== state.data.targetTopic;

    // Unadvertise previous topic if it changed
    if (isTopicChanged && prevTopic.current) {
      context.unadvertise?.(prevTopic.current);
    }

    // Advertise new topic
    if (state.data.targetTopic) {
      context.advertise?.(state.data.targetTopic, "geometry_msgs/msg/Twist");
      prevTopic.current = state.data.targetTopic;
    }

    return () => {
      if (state.data.targetTopic) {
        context.unadvertise?.(state.data.targetTopic);
      }
    };
  }, [context, state.data.targetTopic]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!state.data.enabled) {
        return;
      }

      const key = event.key.toLowerCase();
      if (!"qweasduiojkl".includes(key)) {
        return;
      }

      // Prevent key repeat events
      if (event.repeat) {
        return;
      }

      setPressedKeys((prev) => {
        const newKeys = new Set(prev);
        newKeys.add(key);

        // console.log("Keys pressed:", Array.from(newKeys).join(""));

        // Calculate combined Twist message from all pressed keys
        const twistMessage = {
          linear: {
            x: 0.0,
            y: 0.0,
            z: 0.0,
          },
          angular: {
            x: 0.0,
            y: 0.0,
            z: 0.0,
          },
        };

        // Accumulate linear velocity changes from all pressed keys
        // Map keyboard controls to movement:
        // w/s: forward/backward (x-axis), a/d: left/right (y-axis), q/e: up/down (z-axis)
        newKeys.forEach((k) => {
          if (k === "w") {
            twistMessage.linear.x += linearSpeed;
          } else if (k === "s") {
            twistMessage.linear.x -= linearSpeed;
          } else if (k === "a") {
            twistMessage.linear.y += linearSpeed;
          } else if (k === "d") {
            twistMessage.linear.y -= linearSpeed;
          } else if (k === "q") {
            twistMessage.linear.z += linearSpeed;
          } else if (k === "e") {
            twistMessage.linear.z -= linearSpeed;
          }
        });

        // Accumulate angular velocity changes from all pressed keys
        // u/o: roll left/right, i/k: pitch up/down, j/l: yaw left/right
        newKeys.forEach((k) => {
          if (k === "u") {
            twistMessage.angular.x += angularSpeed;
          } else if (k === "o") {
            twistMessage.angular.x -= angularSpeed;
          } else if (k === "i") {
            twistMessage.angular.y -= angularSpeed;
          } else if (k === "k") {
            twistMessage.angular.y += angularSpeed;
          } else if (k === "j") {
            twistMessage.angular.z += angularSpeed;
          } else if (k === "l") {
            twistMessage.angular.z -= angularSpeed;
          }
        });

        if (state.data.targetTopic) {
          context.publish?.(state.data.targetTopic, twistMessage);
        }

        prevPressedKeysSize.current = newKeys.size;

        return newKeys;
      });
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (!state.data.enabled) {
        return;
      }

      const key = event.key.toLowerCase();
      if ("qweasduiojkl".includes(key)) {
        setPressedKeys((prev) => {
          const newKeys = new Set(prev);
          newKeys.delete(key);

          // Send zero velocity Twist message when all keys are released
          if (newKeys.size === 0 && prevPressedKeysSize.current > 0) {
            const stopMessage = {
              linear: { x: 0.0, y: 0.0, z: 0.0 },
              angular: { x: 0.0, y: 0.0, z: 0.0 },
            };
            if (state.data.targetTopic) {
              context.publish?.(state.data.targetTopic, stopMessage);
            }
          }

          prevPressedKeysSize.current = newKeys.size;
          return newKeys;
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [
    state.data.enabled,
    state.data.allowOnlyFocus,
    state.data.targetTopic,
    linearSpeed,
    angularSpeed,
    context,
  ]);

  return {
    pressedKeys,
  };
}
