import { PanelExtensionContext, Topic, VariableValue } from "@foxglove/extension";
import { ReactElement, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";

import { BoundingBoxLayer } from "./comps/BoundingBoxLayer";
import { Canvas } from "./comps/Canvas";
import { ImageLayer } from "./comps/ImageLayer";
import { detection2DArrayConverter } from "./converter";
import { useDetectionLabel } from "./hooks/useDetectionLabel";
import { useRenderImage } from "./hooks/useRenderImage";
import { useSettingsPanel } from "./hooks/useSettingsPanel";
import { Detection2DArrayMessageEvent, ImageMessageEvent } from "./types";
import { isValidString } from "../lib/utils/topics";

function Detection2DPanel({ context }: { context: PanelExtensionContext }): ReactElement {
  const [imgEvent, setImgEvent] = useState<ImageMessageEvent>();
  const [detection2dArrayEvent, setDetection2dArrayEvent] =
    useState<Detection2DArrayMessageEvent>();

  const [topics, setTopics] = useState<readonly Topic[] | undefined>(() => []);
  const [variables, setVariables] = useState<ReadonlyMap<string, VariableValue> | undefined>();
  const [renderDone, setRenderDone] = useState<(() => void) | undefined>();

  const { state } = useSettingsPanel(context, topics);
  const objectLabels = useDetectionLabel(context, variables, state.data.objectLabelData);

  const imgAnnotations = useMemo(() => {
    if (!detection2dArrayEvent) {
      return undefined;
    }

    const options = {
      texts: { font_size: state.display.fontSize, y_offset: -15 },
      objectLabels,
      state,
    };

    return detection2DArrayConverter(detection2dArrayEvent.message, options);
  }, [detection2dArrayEvent, objectLabels, state]);

  //----- Panel Initialization -----
  useLayoutEffect(() => {
    context.onRender = (renderState, done) => {
      setRenderDone(() => done);
      setTopics(renderState.topics ?? []);
      setVariables(renderState.variables as ReadonlyMap<string, VariableValue>);

      // message frame update
      const hasFrame =
        renderState.currentFrame != undefined &&
        renderState.currentFrame.length > 0 &&
        isValidString(state.data.imageTopic) &&
        isValidString(state.data.detectionTopic);

      if (hasFrame) {
        for (const msg of renderState.currentFrame) {
          switch (msg.topic) {
            case state.data.imageTopic:
              setImgEvent(msg as ImageMessageEvent);
              break;
            case state.data.detectionTopic:
              setDetection2dArrayEvent(msg as Detection2DArrayMessageEvent);
              break;
            default:
              break;
          }
        }
      }
    };
    context.watch("topics");
    context.watch("variables");
    context.watch("currentFrame");
  }, [context, state.data.imageTopic, state.data.detectionTopic]);

  const imageCanvas = useRenderImage(imgEvent);

  // notify painting render done
  useEffect(() => {
    renderDone?.();
  }, [renderDone]);

  return (
    <Canvas>
      <ImageLayer image={imageCanvas} />
      <BoundingBoxLayer
        image={imageCanvas}
        annotations={imgAnnotations}
        isShow={state.display.boundingBox}
      />
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
