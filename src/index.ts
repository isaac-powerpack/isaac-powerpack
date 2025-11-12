import { ExtensionContext } from "@foxglove/extension";
import { ImageAnnotations, Pose, Vector2 } from "@foxglove/schemas";

import { initExamplePanel } from "./ExamplePanel";

type PoseWithCovariance = {
  covariance: number[]; // length 36
  pose: Pose;
}

type ObjectHypothesisWithPose={
  hypothesis: {
    class_id: string,
    score: number, // [0-1]
  };
  pose: PoseWithCovariance;

}


type Pose2D ={
  position: Vector2;
  theta: number;
}

type BoundingBox2D = {
  center: Pose2D;
  size_x: number;
  size_y: number;
}



type Detection2D = {
  header: Header;
  results: ObjectHypothesisWithPose[];
  bbox: BoundingBox2D;
  id: string;
}

type Header = {
  stamp: { sec: number; nanosec: number };
  frame_id: string;
}

type Detection2DArray = {
  header: Header;
  detections: Detection2D[];
}

export function activate(extensionContext: ExtensionContext): void {
  extensionContext.registerPanel({ name: "example-panel", initPanel: initExamplePanel });
  extensionContext.registerMessageConverter({
      type: "schema",
      fromSchemaName: "vision_msgs/msg/Detection2DArray",
      toSchemaName: "foxglove.ImageAnnotations",
      converter: (msg: Detection2DArray): Partial<ImageAnnotations> => {
        const timestamp = { sec: msg.header.stamp.sec, nsec: msg.header.stamp.nanosec };

        const textLabel = (timestamp:any, text:string, position:Vector2) => ({
            timestamp,
            text,
            position,
            font_size: 12,
            text_color: { r: 1, g: 1, b: 1, a: 1 },
            background_color: { r: 0, g: 0, b: 0, a: 0.7 },
        });

        const boundingBoxes = msg.detections.map((detection) => {
          const bbox = detection.bbox;
          const centerX = bbox.center.position.x;
          const centerY = bbox.center.position.y;
          const width = bbox.size_x;
          const height = bbox.size_y;
          
          // Calculate corner points for bounding box
          const left = centerX - width / 2;
          const right = centerX + width / 2;
          const top = centerY - height / 2;
          const bottom = centerY + height / 2;
          
          return {
            timestamp,
            type: 2, // LINE_LOOP to draw closed rectangle
            points: [
              { x: left, y: top },
              { x: right, y: top },
              { x: right, y: bottom },
              { x: left, y: bottom },
            ],
            outline_color: { r: 0, g: 1, b: 0, a: 1 },
            outline_colors: [],
            fill_color: { r: 0, g: 1, b: 0, a: 0.2 },
            thickness: 2,
          };
        });

        const texts = msg.detections.map((detection) => {
          const bbox = detection.bbox;
          const centerX = bbox.center.position.x;
          const centerY = bbox.center.position.y;
          const classId = detection.results[0]?.hypothesis?.class_id || "id-unknown";
          const score = detection.results[0]?.hypothesis?.score;
          const text = score !== undefined ? `id:${classId} (${(score*100).toFixed(1)}%)` : classId;
          const top = centerY - (bbox.size_y / 2);
          const left = centerX - (bbox.size_x / 2);
          
          return [
            // id
            textLabel(timestamp, text, { x: left, y: top + 12 }),
          // score

        ];

        });

        return {
          points: [...boundingBoxes],
          texts: texts.flat(),
        };
      },
    });
}
