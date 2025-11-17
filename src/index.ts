import { ExtensionContext } from "@foxglove/extension";

// import { initExamplePanel } from "./examples/ExamplePanel";
import { detection2DArrayConverter } from "./detection2D/converter";

export function activate(extensionContext: ExtensionContext): void {
  // extensionContext.registerPanel({ name: "example-panel", initPanel: initExamplePanel });
  extensionContext.registerMessageConverter({
    type: "schema",
    fromSchemaName: "vision_msgs/msg/Detection2DArray",
    toSchemaName: "foxglove.ImageAnnotations",
    converter: detection2DArrayConverter,
  });
}
