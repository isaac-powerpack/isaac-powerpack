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

export type SensorImage = {
  header: Header;

  /** image height, number of rows */
  height: number;        // uint32

  /** image width, number of columns */
  width: number;         // uint32

  /**
   * Encoding of pixels -- channel meaning, ordering, size.
   * e.g. "rgb8", "bgr8", "mono8", "rgba8", "32FC1", etc.
   */
  encoding: string;

  /** is this data big-endian? */
  is_bigendian: number;  // uint8 (0 or 1)

  /** Full row length in bytes */
  step: number;          // uint32

  /** actual image data, size is (step * height) bytes */
  data: number[];        // uint8[]
  // If you prefer a typed array:
  // data: Uint8Array;
}

// Custom event message
export type ImageMessageEvent = MessageEvent<SensorImage>;
