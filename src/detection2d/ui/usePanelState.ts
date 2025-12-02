import { PanelExtensionContext, SettingsTreeAction, Topic } from "@foxglove/extension";
import { useCallback, useEffect, useState } from "react";
import { produce } from "immer";
import { set } from "lodash";

const DEFAULT_OBJECT_LABEL_VAR_NAME = "ipp_default_object_label";

export type PanelState = {
    data: {
        topic?: string,
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

export function usePanelState(context: PanelExtensionContext, imageTopics: readonly Topic[]) {
    // Define panel settings data
    const [state, setState] = useState<PanelState>(() => {
        const initialState = context.initialState as Partial<PanelState>;
        return {
            data: {
                topic: initialState?.data?.topic,
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

    // Define handler for panel settings changes
    const actionHandler = useCallback((action: SettingsTreeAction) => {
        if (action.action === "update") {
            const { path, value } = action.payload;
            setState(produce((draft) => set(draft, path, value)));
            if (path[1] === "topic") {
                console.info("Subscribing to topic:", value);
                context.subscribe([{ topic: value as string }]);
            }

        } else if (action.action === "perform-node-action") {
            console.log("perform-node-action action");
        }
    }, [context]);

    // Define Panel Settings UI
    useEffect(() => {
        context.saveState(state);

        const topicOptions = imageTopics.map((topic) => ({ value: topic.name, label: topic.name }));

        context.updatePanelSettingsEditor({
            actionHandler,
            nodes: {
                data: {
                    label: "General",
                    fields: {
                        topic: {
                            label: "Topic",
                            input: "select",
                            options: topicOptions,
                            value: state.data.topic,
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

    }, [imageTopics, actionHandler, context, state]);

    return { state, setState };
}