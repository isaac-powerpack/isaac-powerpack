import { PanelExtensionContext, SettingsTreeAction, Topic } from "@foxglove/extension";
import { useCallback, useEffect, useState } from "react";
import { produce } from "immer";
import { set } from "lodash";
import { useFilterTopics } from "../../lib/hooks/useFilterTopics";

const DEFAULT_OBJECT_LABEL_VAR_NAME = "ipp_default_object_label";

export type PanelState = {
    data: {
        imageTopic?: string,
        detectionTopic?: string,
        // reference string to variable name
        objectLabelData?: string,
    },
    display: {
        boundingBox: boolean,
        id: boolean,
        score: boolean,
        objectLabel: boolean,
    }
};

export function useSettingsPanel(context: PanelExtensionContext, topics: readonly Topic[] | undefined) {

    const allImageTopics = useFilterTopics(topics, ["sensor_msgs/msg/Image"]);
    const allDetectionTopics = useFilterTopics(topics, ["vision_msgs/msg/Detection2DArray"]);


    // Define panel settings data
    const [state, setState] = useState<PanelState>(() => {
        const initialState = context.initialState as Partial<PanelState>;
        return {
            data: {
                imageTopic: initialState?.data?.imageTopic,
                detectionTopic: initialState?.data?.detectionTopic,
                objectLabelData: initialState?.data?.objectLabelData ?? DEFAULT_OBJECT_LABEL_VAR_NAME,
            },
            display: {
                boundingBox: initialState?.display?.boundingBox ?? true,
                id: initialState?.display?.id ?? true,
                score: initialState?.display?.score ?? true,
                objectLabel: initialState?.display?.objectLabel ?? true,
            },
        };
    });

    // Define Panel Settings UI & Handlers
    const actionHandler = useCallback((action: SettingsTreeAction) => {
        if (action.action === "update") {
            const { path, value } = action.payload;
            setState(produce((draft) => set(draft, path, value)));
        } else if (action.action === "perform-node-action") {
            console.log("perform-node-action action");
        }
    }, [context]);


    useEffect(() => {
        context.saveState(state);

        const topicOptions = allImageTopics.map((topic) => ({ value: topic.name, label: topic.name }));
        const detectionTopicOptions = allDetectionTopics.map((topic) => ({ value: topic.name, label: topic.name }));

        context.updatePanelSettingsEditor({
            actionHandler,
            nodes: {
                data: {
                    label: "General",
                    fields: {
                        imageTopic: {
                            label: "Image Topic",
                            input: "select",
                            options: topicOptions,
                            value: state.data.imageTopic,
                            help: "Topic to subscribe for image data. (sensor_msgs/msg/Image)",
                        },
                        detectionTopic: {
                            label: "Detection Topic",
                            input: "select",
                            options: detectionTopicOptions,
                            value: state.data.detectionTopic,
                            help: "Topic to subscribe for 2D detection data. (vision_msgs/msg/Detection2DArray)",
                        },

                        objectLabelData: {
                            label: "Object Label Data",
                            input: "string",
                            value: state.data.objectLabelData,
                            help: "Variable name pointed to the data mapping between id and label. Specify \"default\" or leave empty to use the default extension mapping data.",
                        },
                    }
                },
                display: {
                    label: "Display",
                    fields: {
                        boundingBox: {
                            label: "Bounding Box",
                            input: "boolean",
                            value: state.display.boundingBox,
                        },
                        id: {
                            label: "Id",
                            input: "boolean",
                            value: state.display.id,
                        },
                        score: {
                            label: "Score",
                            input: "boolean",
                            value: state.display.score,
                        },
                        objectLabel: {
                            label: "Object Label",
                            input: "boolean",
                            value: state.display.objectLabel,
                        },
                    }
                }
            }
        });

    }, [allImageTopics, allDetectionTopics, actionHandler, context, state]);

    // Default imageTopic
    useEffect(() => {
        if (state.data.imageTopic !== undefined || allImageTopics.length === 0) {
            return;
        }

        const topicNames = allImageTopics.map((topic) => topic.name);
        const hasResizeImage = topicNames.includes("/resize/image");
        const defaultTopic = hasResizeImage ? "/resize/image" : allImageTopics[0]?.name;

        setState(produce((draft) => {
            draft.data.imageTopic = defaultTopic;
        }));

    }, [state.data.imageTopic, allImageTopics]);

    // Default detectionTopic
    useEffect(() => {
        if (state.data.detectionTopic !== undefined || allDetectionTopics.length === 0) {
            return;
        }

        setState(produce((draft) => {
            draft.data.detectionTopic = allDetectionTopics[0]?.name;
        }));

    }, [state.data.detectionTopic, allDetectionTopics]);

    // Subscribe to topic changes
    useEffect(() => {
        const subscriptions: { topic: string }[] = [];

        if (state.data.imageTopic) {
            subscriptions.push({ topic: state.data.imageTopic });
        }
        if (state.data.detectionTopic) {
            subscriptions.push({ topic: state.data.detectionTopic });
        }

        if (subscriptions.length === 0) {
            console.warn("No topics selected for subscription.");
            return;
        }

        console.info("Subscribing to topics:", subscriptions.map(s => s.topic));
        context.subscribe(subscriptions);
    }, [context, state.data.imageTopic, state.data.detectionTopic]);

    return { state, setState };
}