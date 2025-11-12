import { ExtensionContext } from "@foxglove/extension";
import { ImageAnnotations, Pose } from "@foxglove/schemas";

import { initExamplePanel } from "./ExamplePanel";

type PoseWithCovariance = {
  covariance: number[], // length 36
  pose: Pose
}

type ObjectHypothesisWithPose={
  hypothesis: {
    class_id: string,
    score: number, // [0-1]
  },
  pose: PoseWithCovariance

}

type Detection2D = {
  header: Header,
  results: ObjectHypothesisWithPose[],
  bbox: any,
  id: string,
}

type Header = {
  stamp: { sec: number; nanosec: number };
  frame_id: string;
}

type Detection2DArray = {
  header: Header
  detections: Detection2D[]
}

export function activate(extensionContext: ExtensionContext): void {
  extensionContext.registerPanel({ name: "example-panel", initPanel: initExamplePanel });
  extensionContext.registerMessageConverter({
      type: "schema",
      fromSchemaName: "vision_msgs/msg/Detection2DArray",
      toSchemaName: "foxglove.ImageAnnotations",
      converter: (_msg: Detection2DArray): Partial<ImageAnnotations> => {
        return {
          texts: [
            {
              timestamp: { sec: 0, nsec: 0 },
              position: { x: 100, y: 100 },
              text: "Be is here",
              font_size: 24,
              text_color: { r: 255, g: 255, b: 255, a: 1 },
              background_color: { r: 0, g: 0, b: 0, a: 0.5 },
            },
          ]
        };
      },
    });
}
