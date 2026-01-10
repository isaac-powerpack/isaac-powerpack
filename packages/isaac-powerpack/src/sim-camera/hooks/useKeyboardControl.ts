import { PanelExtensionContext } from "@foxglove/extension";
import { useEffect, useRef, useState } from "react";

import { PanelState } from "./useSettingsPanel";
import { Quaternion, Euler, MathUtils } from "three";

const deltaPosMove = 0.1; //meters per key press
const deltaOrientationDeg = 2; //degrees per key press

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
      let poseMessage = {
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

      // Map keyboard controls to camera movement in cameara frame:
      // w/s: forward/backward (x-axis), a/d: left/right (y-axis), q/e: up/down (z-axis)
      if (key === "w") {
        poseMessage.position.x = deltaPosMove;
      } else if (key === "s") {
        poseMessage.position.x = -deltaPosMove;
      } else if (key === "a") {
        poseMessage.position.y = -deltaPosMove;
      } else if (key === "d") {
        poseMessage.position.y = deltaPosMove;
      } else if (key === "q") {
        poseMessage.position.z = deltaPosMove;
      } else if (key === "e") {
        poseMessage.position.z = -deltaPosMove;
      }

      // u/o: roll left/right, i/k: pitch up/down, j/l: yaw left/right
      let roll = 0.0;
      let pitch = 0.0;
      let yaw = 0.0;

      if (key === "u") {
        roll = -deltaOrientationDeg;
      } else if (key === "o") {
        roll = deltaOrientationDeg;
      } else if (key === "i") {
        pitch = deltaOrientationDeg;
      } else if (key === "k") {
        pitch = -deltaOrientationDeg;
      } else if (key === "j") {
        yaw = -deltaOrientationDeg;
      } else if (key === "l") {
        yaw = deltaOrientationDeg;
      }

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
