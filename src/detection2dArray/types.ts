import { Pose, Vector2 } from "@foxglove/schemas";

export type PoseWithCovariance = {
  covariance: number[]; // length 36
  pose: Pose;
}

export type ObjectHypothesisWithPose={
  hypothesis: {
    class_id: string,
    score: number, // [0-1]
  };
  pose: PoseWithCovariance;

}


export type Pose2D ={
  position: Vector2;
  theta: number;
}

export type BoundingBox2D = {
  center: Pose2D;
  size_x: number;
  size_y: number;
}

export type Detection2D = {
  header: Header;
  results: ObjectHypothesisWithPose[];
  bbox: BoundingBox2D;
  id: string;
}

export type Header = {
  stamp: { sec: number; nanosec: number };
  frame_id: string;
}

export type Detection2DArray = {
  header: Header;
  detections: Detection2D[];
}
