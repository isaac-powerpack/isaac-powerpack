import { Topic } from "@foxglove/extension";
import { useMemo } from "react";

export function useFilterTopics(topics: readonly Topic[] | undefined, schemaName: string[]) {
  const filterTopics = useMemo(
    () => (topics ?? []).filter((topic) => schemaName.includes(topic.schemaName)),
    [topics],
  );

  return filterTopics;
}
