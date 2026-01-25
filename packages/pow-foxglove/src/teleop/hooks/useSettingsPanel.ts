import { PanelExtensionContext, SettingsTreeAction, Topic } from "@foxglove/extension";
import { produce } from "immer";
import { set } from "lodash";
import { useCallback, useEffect, useState } from "react";

import { useFilterTopics } from "../../lib/hooks/useFilterTopics";

const defaultLinearSpeedMeter = 0.2; //m/s
const defaultAngularSpeedRad = 0.0873; //rad/s (~5 degrees) per key press

export type PanelState = {
  data: {
    enabled: boolean;
    targetTopic?: string;
    linearSpeedMeter: number; // meter move change per key press
    angularSpeedRad: number; // degree orientation change per key press
  };
  display: {
    showDesc: boolean; // whether to show description text in the panel
  };
};

export function useSettingsPanel(
  context: PanelExtensionContext,
  topics: readonly Topic[] | undefined,
): { state: PanelState; setState: React.Dispatch<React.SetStateAction<PanelState>> } {
  const allCameraTopics = useFilterTopics(topics, ["geometry_msgs/msg/Twist"]);
  // Define panel settings data
  const [state, setState] = useState<PanelState>(() => {
    const initialState = context.initialState as Partial<PanelState> | undefined;
    return {
      data: {
        enabled: initialState?.data?.enabled ?? true,
        targetTopic: initialState?.data?.targetTopic,
        linearSpeedMeter: initialState?.data?.linearSpeedMeter ?? defaultLinearSpeedMeter,
        angularSpeedRad: initialState?.data?.angularSpeedRad ?? defaultAngularSpeedRad,
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
            targetTopic: {
              label: "Topic",
              input: "select",
              options: topicOptions,
              value: state.data.targetTopic,
              help: "Topic to publish Twist messages (geometry_msgs/msg/Twist)",
            },
            linearSpeedMeter: {
              label: "Linear speed (m/s)",
              input: "number",
              value: state.data.linearSpeedMeter,
              help: "Linear speed change in m/s.",
            },
            angularSpeedRad: {
              label: "Angular speed (rad/s)",
              input: "number",
              value: state.data.angularSpeedRad,
              help: "Angular speed change in rad/s.",
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
