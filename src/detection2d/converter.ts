import {
  CircleAnnotation,
  ImageAnnotations,
  PointsAnnotation,
  TextAnnotation,
  Vector2,
} from "@foxglove/schemas";

import defaultLabelsJson from "./default.label.json";
import { PanelState } from "./hooks/useSettingsPanel";
import { Detection2DArray } from "./types";

type ConverterOptions = {
  circles?: Partial<CircleAnnotation>;
  points?: Partial<PointsAnnotation>;
  texts?: Partial<TextAnnotation> & { y_offset?: number };
  objectLabels?: ReadonlyMap<string, string>;
  state?: PanelState;
};

const defaultLabels: ReadonlyMap<string, string> = new Map(Object.entries(defaultLabelsJson));

function detection2DArrayConverter(
  msg: Detection2DArray,
  options?: ConverterOptions,
): Partial<ImageAnnotations> {
  const labels = options?.objectLabels ?? defaultLabels;

  const timestamp = { sec: msg.header.stamp.sec, nsec: msg.header.stamp.nanosec };

  const isShowId = options?.state?.display.id ?? true;
  const isShowScore = options?.state?.display.score ?? true;
  const isShowObjectLabel = options?.state?.display.objectLabel ?? true;

  const createTextLabel = (text: string, position: Vector2) => ({
    timestamp,
    text,
    position,
    font_size: options?.texts?.font_size ?? 12,
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
    const classId = detection.results[0]?.hypothesis.class_id ?? "unknown";
    const score = detection.results[0]?.hypothesis.score;
    const top = centerY - bbox.size_y / 2;
    const left = centerX - bbox.size_x / 2;
    const bottom = centerY + bbox.size_y / 2;
    const output = [];
    let mainText = "";

    if (isShowObjectLabel) {
      const objectName = labels.get(classId) ?? "unknown";
      output.push(createTextLabel(objectName, { x: left, y: bottom }));
    }

    if (isShowId) {
      mainText += `ID:${classId}`;
    }

    if (isShowScore) {
      const scoreValue = score ?? 0;
      mainText += `${mainText !== "" ? " " : ""}(${(scoreValue * 100).toFixed(1)}%)`;
    }

    // mainText is not ""
    if (mainText !== "") {
      const yOffset = options?.texts?.y_offset ?? 12;
      output.push(createTextLabel(mainText, { x: left, y: top + yOffset }));
    }

    return output;
  });

  return {
    points: [...boundingBoxes],
    texts: texts.flat(),
  };
}

export { detection2DArrayConverter };
