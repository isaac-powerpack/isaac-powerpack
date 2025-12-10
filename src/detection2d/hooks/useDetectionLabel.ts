import { PanelExtensionContext } from "@foxglove/extension";
import { useLayoutEffect, useRef } from "react";

import { DEFAULT_OBJECT_LABEL_VAR_NAME } from "../constants";
import defaultLabel from "../default.label.json";

export function useDetectionLabel(
  context: PanelExtensionContext,
  variables: ReadonlyMap<string, any> | undefined,
  variableName: string | undefined,
) {
  const isInit = useRef(false);

  // Create default object label variable if not exists
  useLayoutEffect(() => {
    if (isInit.current) {
      console.log("do nothing, already init");
      return;
    }

    console.log("init object label variable name");
    const defaultObjectLabelVar = variables?.get(DEFAULT_OBJECT_LABEL_VAR_NAME);

    if (!defaultObjectLabelVar) {
      context.setVariable(DEFAULT_OBJECT_LABEL_VAR_NAME, defaultLabel);
    }

    isInit.current = true;
  }, [variables]);

  const labels =
    variables?.get(variableName || "") ?? variables?.get(DEFAULT_OBJECT_LABEL_VAR_NAME);

  if (!labels) {
    return new Map();
  }

  return new Map(Object.entries(labels));
}
