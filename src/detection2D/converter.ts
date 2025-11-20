import { ImageAnnotations, Vector2 } from "@foxglove/schemas";

import defaultLabel from "./default.label.json";
import { Detection2DArray } from "./types";

function detection2DArrayConverter(msg: Detection2DArray): Partial<ImageAnnotations> {

  const objectLabel = defaultLabel;

  const timestamp = { sec: msg.header.stamp.sec, nsec: msg.header.stamp.nanosec };

  const textLabel = (timestamp: any, text: string, position: Vector2) => ({
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

  const labels: Record<string, string> = objectLabel ?? {};

  const texts = msg.detections.map((detection) => {
    const bbox = detection.bbox;
    const centerX = bbox.center.position.x;
    const centerY = bbox.center.position.y;
    const classId = detection.results[0]?.hypothesis?.class_id ?? "unknown";
    const score = detection.results[0]?.hypothesis?.score;
    const top = centerY - bbox.size_y / 2;
    const left = centerX - bbox.size_x / 2;
    const bottom = centerY + bbox.size_y / 2;



    const output = []


    const objectName = labels[classId] ?? "unknown";
    output.push(textLabel(timestamp, objectName, { x: left, y: bottom }));

    let mainText = "";
    mainText += `id:${classId}`;
    const scoreValue = score || 0;
    mainText += `${mainText ? " " : ""}(${(scoreValue * 100).toFixed(1)}%)`;
    output.push(textLabel(timestamp, mainText, { x: left, y: top + 12 }));

    return output;
  });

  return {
    points: [...boundingBoxes],
    texts: texts.flat(),
  };
}

export { detection2DArrayConverter };
