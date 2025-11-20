import { PanelExtensionContext, SettingsTreeAction, Topic } from "@foxglove/extension";
import { ReactElement, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { produce } from "immer";
import defaultLabel from "./default.label.json";

type PanelState = {
    data: {
        topic?: string,
        // reference string to variable name
        objectLabelData?: string,
    },
    display: {
        enable: boolean,
        id: boolean,
        score: boolean,
        objectLabel: boolean,
    }
}

const DEFAULT_OBJECT_LABEL_VAR_NAME = "ipp_default_object_label";

function Detection2DPanel({ context }: { context: PanelExtensionContext }): ReactElement {
    const [topics, setTopics] = useState<readonly Topic[] | undefined>();
    const [renderDone, setRenderDone] = useState<(() => void) | undefined>();
    const isInit = useRef(false);
    const [state, setState] = useState<PanelState>(() => {
        const initialState = context.initialState as Partial<PanelState>;
        return {
            data: {
                topic: initialState?.data?.topic,
                objectLabelData: initialState?.data?.objectLabelData ?? DEFAULT_OBJECT_LABEL_VAR_NAME,
            },
            display: {
                enable: initialState?.display?.enable ?? true,
                id: initialState?.display?.id ?? true,
                score: initialState?.display?.score ?? true,
                objectLabel: initialState?.display?.objectLabel ?? true,
            },
        };
    });

    //----- Core Panel Rendering Setup -----
    useLayoutEffect(() => {
        context.onRender = (renderState, done) => {
            setRenderDone(() => done);
            setTopics(renderState.topics);

            const variables = renderState.variables;
            const defaultObjectLabelVar = variables?.get(DEFAULT_OBJECT_LABEL_VAR_NAME);
            if (!isInit.current) {
                if (!defaultObjectLabelVar) {
                    context.setVariable(DEFAULT_OBJECT_LABEL_VAR_NAME, defaultLabel);
                }
                isInit.current = true;
            }
        }
        context.watch("topics");
        context.watch("variables")
    }, [context]);

    useEffect(() => {
        renderDone?.();
    }, [renderDone]);

    // Setting Editor

    const imageTopics = useMemo(
        () => (topics ?? []).filter((topic) =>
            topic.schemaName === "sensor_msgs/msg/Image"
        ),
        [topics],
    );

    const actionHandler = useCallback((action: SettingsTreeAction) => {
        if (action.action === "update") {
            console.log("Be:", "Update action");
        }
    }, [context]);

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
                        showScore: {
                            label: "Show Score",
                            input: "boolean",
                            value: state.display.score,
                        },
                        showLabel: {
                            label: "Show Label",
                            input: "boolean",
                            value: state.display.objectLabel,
                        },
                    }
                }
            }
        });

    }, [imageTopics, actionHandler, context, state]);

    // Select default topic
    useEffect(() => {
        if (state.data.topic !== undefined || imageTopics.length === 0) {
            return
        }

        const topicNames = imageTopics.map((topic) => topic.name);
        console.log("image topics names:", topicNames);
        const hasResizeImage = topicNames.includes("/resize/image");
        const defaultTopic = hasResizeImage ? "/resize/image" : imageTopics[0]?.name;

        setState(produce((draft) => {
            draft.data.topic = defaultTopic;
        }));

    }, [state.data.topic, imageTopics]);

    return (
        <div style={{ padding: "1rem" }}>
            <h2>Detection2D Panel</h2>
            <p>This panel is under construction.</p>
        </div>
    );
}

export function initDetection2DPanel(context: PanelExtensionContext): () => void {
    const root = createRoot(context.panelElement);
    root.render(<Detection2DPanel context={context} />);

    // Return a function to run when the panel is removed
    return () => {
        root.unmount();
    };
}
