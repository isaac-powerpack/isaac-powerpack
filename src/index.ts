import { ExtensionContext } from "@foxglove/extension";

import { detection2DArrayConverter, initDetection2DPanel } from "./detection2D";

export function activate(extensionContext: ExtensionContext): void {
  extensionContext.registerPanel({ name: "Detection 2D", initPanel: initDetection2DPanel });
  extensionContext.registerMessageConverter({
    type: "schema",
    fromSchemaName: "vision_msgs/msg/Detection2DArray",
    toSchemaName: "foxglove.ImageAnnotations",
    converter: detection2DArrayConverter,
  });
}
