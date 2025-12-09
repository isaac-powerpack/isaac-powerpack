import { PanelExtensionContext, Topic } from "@foxglove/extension";
import { ReactElement, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import defaultLabel from "./default.label.json";
import { Detection2DArrayMessageEvent, ImageMessageEvent } from "./types";
import { useSettingsPanel } from "./hooks/useSettingsPanel";
import { isValidString } from "../lib/utils/topics";
import { useRenderImage } from "./hooks/useRenderImage";
import { Canvas } from "./comps/Canvas";
import { ImageLayer } from "./comps/ImageLayer";
import { detection2DArrayConverter } from "./converter";
import { BoundingBoxLayer } from "./comps/BoundingBoxLayer";

const DEFAULT_OBJECT_LABEL_VAR_NAME = "ipp_default_object_label";

function Detection2DPanel({ context }: { context: PanelExtensionContext }): ReactElement {
    const [imgEvent, setImgEvent] = useState<ImageMessageEvent>();
    const [detection2dArrayEvent, setDetection2dArrayEvent] = useState<Detection2DArrayMessageEvent>();

    const [topics, setTopics] = useState<readonly Topic[] | undefined>(() => []);
    const [variables, setVariables] = useState<ReadonlyMap<string, any> | undefined>();
    const [renderDone, setRenderDone] = useState<(() => void) | undefined>();
    const isInit = useRef(false);
    const imgAnnotations = useMemo(() => {
        if (!detection2dArrayEvent) {
            return undefined;
        }
        return detection2DArrayConverter(detection2dArrayEvent.message);
    }, [detection2dArrayEvent]);

    const { state } = useSettingsPanel(context, topics);

    //----- Panel Initialization -----
    useLayoutEffect(() => {
        context.onRender = (renderState, done) => {
            setRenderDone(() => done);
            setTopics(renderState.topics ?? []);
            setVariables(renderState.variables);

            // message frame update
            const hasFrame =
                renderState.currentFrame &&
                renderState.currentFrame.length > 0 &&
                isValidString(state.data.imageTopic);

            if (hasFrame) {
                renderState.currentFrame.forEach((msg: any) => {
                    switch (msg.topic) {
                        case state.data.imageTopic:
                            setImgEvent(msg);
                            break;
                        case state.data.detectionTopic:
                            setDetection2dArrayEvent(msg);
                            break;
                        default:
                            break;
                    }
                });
            }
        }
        context.watch("topics");
        context.watch("variables");
        context.watch("currentFrame");
    }, [context, state.data.imageTopic]);

    const imageCanvas = useRenderImage(imgEvent);


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
    }, [variables]);

    // notify painting render done
    useEffect(() => {
        renderDone?.();
    }, [renderDone]);

    return (
        <Canvas>
            <ImageLayer image={imageCanvas} />
            <BoundingBoxLayer image={imageCanvas} annotations={imgAnnotations} />
        </Canvas>
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
