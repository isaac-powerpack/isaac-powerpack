import { ExtensionContext } from "@foxglove/extension";

// import { initExamplePanel } from "./ExamplePanel";
import { detection2DArraySchemaConverter } from "./detection2dArray/converter";


export function activate(extensionContext: ExtensionContext): void {
  // extensionContext.registerPanel({ name: "example-panel", initPanel: initExamplePanel });
  extensionContext.registerMessageConverter({
      type: "schema",
      fromSchemaName: "vision_msgs/msg/Detection2DArray",
      toSchemaName: "foxglove.ImageAnnotations",
      converter: detection2DArraySchemaConverter,
  });
}
