import { ExtensionContext } from "@foxglove/extension";
import { PREFIX } from "./constants";

import { Detection2DArray, detection2DArrayConverter, initDetection2DPanel } from "./detection2d";
import { initSimCameraPanel } from "./sim-camera/panel";

export function activate(extensionContext: ExtensionContext): void {
  // Detection2D Module
  extensionContext.registerPanel({
    name: `${PREFIX}: Detection 2D`,
    initPanel: initDetection2DPanel,
  });
  extensionContext.registerMessageConverter({
    type: "schema",
    fromSchemaName: "vision_msgs/msg/Detection2DArray",
    toSchemaName: "foxglove.ImageAnnotations",
    converter: (msg: Detection2DArray) => detection2DArrayConverter(msg),
  });

  // SimCamera Module
  extensionContext.registerPanel({
    name: `${PREFIX}: SimCamera`,
    initPanel: initSimCameraPanel,
  });
}
