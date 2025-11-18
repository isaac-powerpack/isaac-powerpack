import { PanelExtensionContext, SettingsTreeAction, Topic } from "@foxglove/extension";
import { ReactElement, useCallback, useEffect, useLayoutEffect, useState } from "react";
import { createRoot } from "react-dom/client";

type PanelState = {
    data: {
        label: string;
        topic?: string,
        visible: boolean;
    },
    settings: {
        enable: boolean
        showId: boolean,
        showScore: boolean,
        showLabel: boolean,
    }
}

function Detection2DPanel({ context }: { context: PanelExtensionContext }): ReactElement {
    const [, setTopics] = useState<readonly Topic[] | undefined>();
    const [renderDone, setRenderDone] = useState<(() => void) | undefined>();
    const [state,] = useState<PanelState>(() => {
        const initialState = context.initialState as Partial<PanelState>;
        return {
            data: {
                label: initialState?.data?.label ?? "Detection2D Panel",
                visible: initialState?.data?.visible ?? true,
                topic: initialState?.data?.topic,
            },
            settings: {
                enable: initialState?.settings?.enable ?? true,
                showId: initialState?.settings?.showId ?? true,
                showScore: initialState?.settings?.showScore ?? true,
                showLabel: initialState?.settings?.showLabel ?? true,
            },
        };
    });

    //----- Core Panel Rendering Setup -----
    useLayoutEffect(() => {
        context.onRender = (renderState, done) => {
            setRenderDone(() => done);
            setTopics(renderState.topics);
        }
        context.watch("topics");
    }, [context]);

    useEffect(() => {
        renderDone?.();
    }, [renderDone]);

    // Setting Editor

    const actionHandler = useCallback((action: SettingsTreeAction) => {
        if (action.action === "update") {
            console.log("Be:", "Update action");
        }
    }, [context]);

    useEffect(() => {
        context.saveState(state);
        context.updatePanelSettingsEditor({
            actionHandler,
            nodes: {
                data: {
                    visible: state.data.visible,
                    label: "General",
                    fields: {
                        topic: {
                            label: "Topic",
                            input: "select",
                            options: [{ value: "/front_stereo_camera/left/image_rect_color", label: "/front_stereo_camera/left/image_rect_color" }, { value: "/front_stereo_camera/right/image_rect_color", label: "/front_stereo_camera/right/image_rect_color" }],
                            value: state.data.topic,
                        }
                    }
                },
                settings: {
                    label: "Settings",
                    fields: {
                        enable: {
                            label: "Enable Detection2D Panel",
                            input: "boolean",
                            value: state.settings.enable,
                        },
                        showId: {
                            label: "Show Detection ID",
                            input: "boolean",
                            value: state.settings.showId,
                        },
                        showScore: {
                            label: "Show Detection Score",
                            input: "boolean",
                            value: state.settings.showScore,
                        },
                        showLabel: {
                            label: "Show Detection Label",
                            input: "boolean",
                            value: state.settings.showLabel,
                        },
                    }
                }
            }
        });

    }, []);

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
