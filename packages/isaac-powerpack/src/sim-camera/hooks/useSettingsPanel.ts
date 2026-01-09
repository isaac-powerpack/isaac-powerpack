import { PanelExtensionContext, SettingsTreeAction, Topic } from "@foxglove/extension";
import { produce } from "immer";
import { set } from "lodash";
import { useCallback, useEffect, useState } from "react";

import { useFilterTopics } from "../../lib/hooks/useFilterTopics";

export type PanelState = {
  data: {
    enabled: boolean;
    cameraControlTopic?: string;
  };
  display: {};
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
      },
      display: {},
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
              label: "Camera Topic",
              input: "select",
              options: topicOptions,
              value: state.data.cameraControlTopic,
              help: "Topic to publish for camera control in Isaac Sim. (geometry_msgs/msg/Pose)",
            },
          },
        },
        display: {
          label: "Display",
          fields: {},
        },
      },
    });
  }, [allCameraTopics, actionHandler, context, state]);

  return { state, setState };
}
