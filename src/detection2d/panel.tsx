import { PanelExtensionContext, Topic } from "@foxglove/extension";
import { ReactElement, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import defaultLabel from "./default.label.json";
import { ImageMessageEvent } from "./types";
import { useDrawImage } from "./ui/useDrawImage";
import { usePanelState } from "./ui/usePanelState";
import { useFilterTopics } from "../lib/hooks/useFilterTopics";

const DEFAULT_OBJECT_LABEL_VAR_NAME = "ipp_default_object_label";

function Detection2DPanel({ context }: { context: PanelExtensionContext }): ReactElement {
    const [message, setMessage] = useState<ImageMessageEvent>();
    const [topics, setTopics] = useState<readonly Topic[] | undefined>();
    const [variables, setVariables] = useState<ReadonlyMap<string, any> | undefined>();

    const [renderDone, setRenderDone] = useState<(() => void) | undefined>();
    const isInit = useRef(false);

    const imageTopics = useFilterTopics(topics, ["sensor_msgs/msg/Image"]);

    const { state } = usePanelState(context, imageTopics);

    const canvasRef = useDrawImage(message);

    //----- Core Panel Rendering Setup -----
    useLayoutEffect(() => {
        context.onRender = (renderState, done) => {
            setRenderDone(() => done);
            setTopics(renderState.topics);
            setVariables(renderState.variables);

            // message frame update
            if (renderState.currentFrame && renderState.currentFrame.length > 0) {
                renderState.currentFrame.forEach((msg: any) => {
                    if (msg.topic === state?.data?.topic) {
                        setMessage(msg as ImageMessageEvent);
                    }
                });
            }
        }
        context.watch("topics");
        context.watch("variables");
        context.watch("currentFrame");
    }, [context, state.data.topic]);

    // init variables
    useLayoutEffect(() => {
        if (isInit.current) {
            console.log("do nothing, already init");
            return;
        }

        console.log("init object label variable name")
        const defaultObjectLabelVar = variables?.get(DEFAULT_OBJECT_LABEL_VAR_NAME);

        if (!defaultObjectLabelVar) {
            context.setVariable(DEFAULT_OBJECT_LABEL_VAR_NAME, defaultLabel);
        }

        isInit.current = true;
    }, [context, variables]);


    // notify painting render done
    useEffect(() => {
        renderDone?.();
    }, [renderDone]);



    return (
        <div style={{ padding: "1rem" }}>
            <h2>Detection2D Panel</h2>
            <canvas
                ref={canvasRef}
                style={{ width: "100%", height: "100%", display: "block" }}
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
