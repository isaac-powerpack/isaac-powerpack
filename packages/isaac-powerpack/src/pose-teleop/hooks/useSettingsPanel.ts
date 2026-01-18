import { PanelExtensionContext, SettingsTreeAction, Topic } from "@foxglove/extension";
import { produce } from "immer";
import { set } from "lodash";
import { useCallback, useEffect, useState } from "react";

import { useFilterTopics } from "../../lib/hooks/useFilterTopics";

const defaultDeltaPosMove = 0.1; //meters per key press
const defaultDeltaOrientationDeg = 2; //degrees per key press

export type PanelState = {
  data: {
    enabled: boolean;
    cameraControlTopic?: string;
    positionMeterDelta: number; // meter move change per key press
    orientationDegDelta: number; // degree orientation change per key press
  };
  display: {
    showDesc: boolean; // whether to show description text in the panel
  };
};

export function useSettingsPanel(
  context: PanelExtensionContext,
  topics: readonly Topic[] | undefined,
): { state: PanelState; setState: React.Dispatch<React.SetStateAction<PanelState>> } {
  const allCameraTopics = useFilterTopics(topics, ["geometry_msgs/msg/Pose"]);
  // Define panel settings data
  const [state, setState] = useState<PanelState>(() => {
    const initialState = context.initialState as Partial<PanelState> | undefined;
    return {
      data: {
        enabled: initialState?.data?.enabled ?? true,
        cameraControlTopic: initialState?.data?.cameraControlTopic,
        positionMeterDelta: initialState?.data?.positionMeterDelta ?? defaultDeltaPosMove,
        orientationDegDelta: initialState?.data?.orientationDegDelta ?? defaultDeltaOrientationDeg,
      },
      display: {
        showDesc: initialState?.display?.showDesc ?? true,
      },
    };
  });

  // Define Panel Settings UI & Handlers
  const actionHandler = useCallback((action: SettingsTreeAction) => {
    if (action.action === "update") {
      const { path, value } = action.payload;
      setState(produce((draft) => set(draft, path, value)));
    } else {
      console.log("perform-node-action action");
    }
  }, []);

  useEffect(() => {
    context.saveState(state);

    const topicOptions = allCameraTopics.map((topic) => ({
      label: topic.name,
      value: topic.name,
    }));

    context.updatePanelSettingsEditor({
      actionHandler,
      nodes: {
        data: {
          label: "General",
          fields: {
            enabled: {
              label: "Enable",
              input: "boolean",
              value: state.data.enabled,
            },
            cameraControlTopic: {
              label: "Camera topic",
              input: "select",
              options: topicOptions,
              value: state.data.cameraControlTopic,
              help: "Topic to publish for camera control in Isaac Sim. (geometry_msgs/msg/Pose)",
            },
            positionMeterDelta: {
              label: "Position delta (meters)",
              input: "number",
              value: state.data.positionMeterDelta,
              help: "Position change in meters per key press.",
            },
            orientationDegDelta: {
              label: "Orientation delta (degrees)",
              input: "number",
              value: state.data.orientationDegDelta,
              help: "Orientation change in degrees per key press.",
            },
          },
        },
        display: {
          label: "Display",
          fields: {
            showDesc: {
              label: "Show description",
              input: "boolean",
              value: state.display.showDesc,
              help: "Show description text guide in the panel.",
            },
          },
        },
      },
    });
  }, [allCameraTopics, actionHandler, context, state]);

  return { state, setState };
}
