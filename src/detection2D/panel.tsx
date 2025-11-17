import { PanelExtensionContext } from "@foxglove/extension";
import { ReactElement } from "react";
import { createRoot } from "react-dom/client";

function Detection2DPanel({ }: { context: PanelExtensionContext }): ReactElement {
    return (
        <div style={{ padding: "1rem" }}>
            <h2>Detection2D Panel</h2>
            <p>This panel is under construction.</p>
        </div>
    );
}

export function initDetection2DPanel(context: PanelExtensionContext): () => void {
    const root = createRoot(context.panelElement);
    root.render(<Detection2DPanel context={context} />);

    // Return a function to run when the panel is removed
    return () => {
        root.unmount();
    };
}
