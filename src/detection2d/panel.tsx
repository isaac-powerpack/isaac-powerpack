import { PanelExtensionContext, SettingsTreeAction, Topic } from "@foxglove/extension";
import { ReactElement, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { produce } from "immer";
import { set } from "lodash";
import defaultLabel from "./default.label.json";
import { SensorImage } from "./types";
type PanelState = {
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
}

type ImageMessageEvent = MessageEvent<SensorImage>;

async function drawImageOnCanvas(img: SensorImage, canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height, encoding, step } = img;

    // Match canvas size to the ROS image
    canvas.width = width;
    canvas.height = height;

    // Make sure we have a Uint8Array to work with
    const src =
        img.data instanceof Uint8Array ? img.data : Uint8Array.from(img.data);

    // Prepare output buffer (RGBA for canvas)
    const imageData = ctx.createImageData(width, height);
    const dst = imageData.data; // Uint8ClampedArray length = width * height * 4

    // Determine number of channels per pixel
    let channels: number;
    switch (encoding) {
        case "mono8":
            channels = 1;
            break;
        case "rgb8":
        case "bgr8":
            channels = 3;
            break;
        case "rgba8":
        case "bgra8":
            channels = 4;
            break;
        default:
            console.warn(`Unsupported encoding: ${encoding}`);
            return;
    }

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const srcIndex = y * step + x * channels;
            const dstIndex = (y * width + x) * 4;

            let r = 0,
                g = 0,
                b = 0,
                a = 255;

            switch (encoding) {
                case "mono8": {
                    const v = src[srcIndex] || 0;
                    r = g = b = v;
                    break;
                }
                case "rgb8": {
                    r = src[srcIndex] || 0;
                    g = src[srcIndex + 1] || 0;
                    b = src[srcIndex + 2] || 0;
                    break;
                }
                case "bgr8": {
                    b = src[srcIndex] || 0;
                    g = src[srcIndex + 1] || 0;
                    r = src[srcIndex + 2] || 0;
                    break;
                }
                case "rgba8": {
                    r = src[srcIndex] || 0;
                    g = src[srcIndex + 1] || 0;
                    b = src[srcIndex + 2] || 0;
                    a = src[srcIndex + 3] || 0;
                    break;
                }
                case "bgra8": {
                    b = src[srcIndex] || 0;
                    g = src[srcIndex + 1] || 0;
                    r = src[srcIndex + 2] || 0;
                    a = src[srcIndex + 3] || 0;
                    break;
                }
            }

            dst[dstIndex] = r;
            dst[dstIndex + 1] = g;
            dst[dstIndex + 2] = b;
            dst[dstIndex + 3] = a;
        }
    }

    ctx.putImageData(imageData, 0, 0);

    // Reset any transforms if you use them elsewhere
    (ctx as any).resetTransform?.();
}

const DEFAULT_OBJECT_LABEL_VAR_NAME = "ipp_default_object_label";

function Detection2DPanel({ context }: { context: PanelExtensionContext }): ReactElement {
    const [message, setMessage] = useState<ImageMessageEvent>();
    const [topics, setTopics] = useState<readonly Topic[] | undefined>();
    const [renderDone, setRenderDone] = useState<(() => void) | undefined>();
    const isInit = useRef(false);
    const isInitTopic = useRef(false);
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

    const canvasRef = useRef<HTMLCanvasElement>(null);

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

    // Setting Editor

    const imageTopics = useMemo(
        () => (topics ?? []).filter((topic) =>
            topic.schemaName === "sensor_msgs/msg/Image"
        ),
        [topics],
    );

    const actionHandler = useCallback((action: SettingsTreeAction) => {
        if (action.action === "update") {
            const { path, value } = action.payload;
            setState(produce((draft) => set(draft, path, value)));
            if (path[1] === "topic") {
                console.info("Subscribing to topic:", value);
                context.subscribe([{ topic: value as string }]);
            }

        } else if (action.action === "perform-node-action") {
            console.log("Be:", "perform-node-action action");
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

    useEffect(() => {
        if (message) {
            drawImageOnCanvas((message as any).message, canvasRef.current!).catch(
                (error: any) => console.log(error),
            );
        }
    }, [message]);

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
