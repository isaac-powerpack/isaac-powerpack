import { PanelExtensionContext, Topic } from "@foxglove/extension";
import { ReactElement, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { produce } from "immer";
import defaultLabel from "./default.label.json";
import { ImageMessageEvent } from "./types";
import { useDrawImage } from "./ui/useDrawImage";
import { usePanelState } from "./ui/usePanelState";

const DEFAULT_OBJECT_LABEL_VAR_NAME = "ipp_default_object_label";

function Detection2DPanel({ context }: { context: PanelExtensionContext }): ReactElement {
    const [message, setMessage] = useState<ImageMessageEvent>();
    const [topics, setTopics] = useState<readonly Topic[] | undefined>();
    const [renderDone, setRenderDone] = useState<(() => void) | undefined>();
    const isInit = useRef(false);
    const isInitTopic = useRef(false);

    const imageTopics = useMemo(
        () => (topics ?? []).filter((topic) =>
            topic.schemaName === "sensor_msgs/msg/Image"
        ),
        [topics],
    );

    const { state, setState } = usePanelState(context, imageTopics);

    const canvasRef = useDrawImage(message);

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

            // message frame update
            if (renderState.currentFrame && renderState.currentFrame.length > 0) {
                renderState.currentFrame.forEach((msg: any) => {
                    if (msg.topic === state.data.topic) {
                        setMessage(msg as ImageMessageEvent);
                    }
                });
            }
        }
        context.watch("topics");
        context.watch("variables");
        context.watch("currentFrame");
    }, [context, state.data.topic]);

    useEffect(() => {
        renderDone?.();
    }, [renderDone]);

    // Select default topic
    useEffect(() => {
        if (isInitTopic.current) {
            return;
        }

        if (imageTopics.length === 0) {
            return;
        }
        else if (state.data.topic !== undefined) {
            console.info("Subscribing to topic:", state.data.topic);
            context.subscribe([{ topic: state.data.topic as string }]);
            isInitTopic.current = true;
            return;
        }

        const topicNames = imageTopics.map((topic) => topic.name);
        const hasResizeImage = topicNames.includes("/resize/image");
        const defaultTopic = hasResizeImage ? "/resize/image" : imageTopics[0]?.name;


        setState(produce((draft) => {
            draft.data.topic = defaultTopic;
        }));
        isInitTopic.current = true;

    }, [context, state.data.topic, imageTopics]);

    return (
        <div style={{ padding: "1rem" }}>
            <h2>Detection2D Panel</h2>
            <canvas
                ref={canvasRef}
                style={{ width: "100%", height: "100%", display: "block", backgroundColor: "orange" }}
            />
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
