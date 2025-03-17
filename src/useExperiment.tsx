import { useContext } from "react";
import { XavierContext } from "./component";
import useSWR, { SWRResponse } from "swr";

export function useExperiment<T = boolean>(
  experimentId: string,
  defaultValue: T,
): SWRResponse<T> {
  const context = useContext(XavierContext);

  if (!context) {
    throw new Error(
      "Xavier is not configured. Please add <Xavier apiToken='...'> with a valid token to your component tree.",
    );
  }

  return useSWR(`assignments`, () =>
    context.getOneExperiment<T>(experimentId, defaultValue),
  );
}
