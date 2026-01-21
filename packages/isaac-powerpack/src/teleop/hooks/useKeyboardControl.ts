import { PanelExtensionContext } from "@foxglove/extension";
import { useEffect, useMemo, useRef, useState } from "react";
import { Quaternion, Euler, MathUtils } from "three";

import { PanelState } from "./useSettingsPanel";

function eulerToQuat(rollDeg: number, pitchDeg: number, yawDeg: number) {
  // convert degrees to radians
  const roll = MathUtils.degToRad(rollDeg);
  const pitch = MathUtils.degToRad(pitchDeg);
  const yaw = MathUtils.degToRad(yawDeg);
  // ZYX order for ros2
  const euler = new Euler(roll, pitch, yaw, "ZYX");
  const quaternion = new Quaternion();
  quaternion.setFromEuler(euler);
  return quaternion;
}

export function useKeyboardControl(
  context: PanelExtensionContext,
  state: PanelState,
): {
  pressedKeys: Set<string>;
} {
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(() => new Set());
  const prevTopic = useRef<string | undefined>();

  //meters per key press
  const deltaPosMove = useMemo(
    () => state.data.positionMeterDelta,
    [state.data.positionMeterDelta],
  );

  //degrees per key press
  const deltaOrientationDeg = useMemo(
    () => state.data.orientationDegDelta,
    [state.data.orientationDegDelta],
  );

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

        console.log("Keys pressed:", Array.from(newKeys).join(""));

        // Calculate combined pose message from all pressed keys
        const poseMessage = {
          position: {
            x: 0.0,
            y: 0.0,
            z: 0.0,
          },
          // identity quaternion representing no rotation
          orientation: {
            x: 0.0,
            y: 0.0,
            z: 0.0,
            w: 1.0,
          },
        };

        // Accumulate position changes from all pressed keys
        // Map keyboard controls to camera movement in camera frame:
        // w/s: forward/backward (x-axis), a/d: left/right (y-axis), q/e: up/down (z-axis)
        newKeys.forEach((k) => {
          if (k === "w") {
            poseMessage.position.x += deltaPosMove;
          } else if (k === "s") {
            poseMessage.position.x -= deltaPosMove;
          } else if (k === "a") {
            poseMessage.position.y += deltaPosMove;
          } else if (k === "d") {
            poseMessage.position.y -= deltaPosMove;
          } else if (k === "q") {
            poseMessage.position.z += deltaPosMove;
          } else if (k === "e") {
            poseMessage.position.z -= deltaPosMove;
          }
        });

        // Accumulate rotation changes from all pressed keys
        // u/o: roll left/right, i/k: pitch up/down, j/l: yaw left/right
        let roll = 0.0;
        let pitch = 0.0;
        let yaw = 0.0;

        newKeys.forEach((k) => {
          if (k === "u") {
            roll += deltaOrientationDeg;
          } else if (k === "o") {
            roll -= deltaOrientationDeg;
          } else if (k === "i") {
            pitch -= deltaOrientationDeg;
          } else if (k === "k") {
            pitch += deltaOrientationDeg;
          } else if (k === "j") {
            yaw += deltaOrientationDeg;
          } else if (k === "l") {
            yaw -= deltaOrientationDeg;
          }
        });

        // update Pose orientation if there is any rotation value by keypress
        if (roll !== 0 || pitch !== 0 || yaw !== 0) {
          const quat = eulerToQuat(roll, pitch, yaw);
          poseMessage.orientation.x = quat.x;
          poseMessage.orientation.y = quat.y;
          poseMessage.orientation.z = quat.z;
          poseMessage.orientation.w = quat.w;
        }

        if (state.data.cameraControlTopic) {
          context.publish?.(state.data.cameraControlTopic, poseMessage);
        }

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
    state.data.cameraControlTopic,
    deltaPosMove,
    deltaOrientationDeg,
    context,
  ]);

  return {
    pressedKeys,
  };
}
