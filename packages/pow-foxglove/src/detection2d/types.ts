import { MessageEvent } from "@foxglove/extension";
import { Pose, Vector2 } from "@foxglove/schemas";

// ROS2 & Foxglove message type definitions
export type PoseWithCovariance = {
  covariance: number[]; // length 36
  pose: Pose;
};

export type ObjectHypothesisWithPose = {
  hypothesis: {
    class_id: string;
    score: number; // [0-1]
  };
  pose: PoseWithCovariance;
};

export type Pose2D = {
  position: Vector2;
  theta: number;
};

export type BoundingBox2D = {
  center: Pose2D;
  size_x: number;
  size_y: number;
};

export type Detection2D = {
  header: Header;
  results: ObjectHypothesisWithPose[];
  bbox: BoundingBox2D;
  id: string;
};

export type Header = {
  stamp: { sec: number; nanosec: number };
  frame_id: string;
};

export type Detection2DArray = {
  header: Header;
  detections: Detection2D[];
};

export interface SensorImage {
  header: Header;
  height: number;
  width: number;

  /**
   * Encoding of pixels -- channel meaning, ordering, size.
   * e.g. "rgb8", "bgr8", "mono8", "rgba8", "32FC1", etc.
   */
  encoding: string;

  /** is this data big-endian */
  is_bigendian: number; // (0 or 1)

  /** Full row length in bytes */
  step: number;

  /** actual image data, size is (step * height) bytes */
  data: number[]; // uint8[]
}

// Custom event message
export type ImageMessageEvent = MessageEvent<SensorImage>;
export type Detection2DArrayMessageEvent = MessageEvent<Detection2DArray>;
