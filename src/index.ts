import { ExtensionContext } from "@foxglove/extension";
import { ImageAnnotations } from "@foxglove/schemas";

import { initExamplePanel } from "./ExamplePanel";

type MyGps = {
  lat: number;
  lon: number;
}

export function activate(extensionContext: ExtensionContext): void {
  extensionContext.registerPanel({ name: "example-panel", initPanel: initExamplePanel });
  extensionContext.registerMessageConverter({
      type: "schema",
      fromSchemaName: "vision_msgs/msg/Detection2DArray",
      toSchemaName: "foxglove.ImageAnnotations",
      converter: (_msg: MyGps): Partial<ImageAnnotations> => {
        return {
          texts: [
            {
              timestamp: { sec: 0, nsec: 0 },
              position: { x: 100, y: 100 },
              text: "Be is here",
              font_size: 24,
              text_color: { r: 255, g: 255, b: 255, a: 1 },
              background_color: { r: 0, g: 0, b: 0, a: 0.5 },
            },
          ]
        };
      },
    });
}
