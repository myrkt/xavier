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
      "API token is not configured. Please call Xavier.configure() with a valid token.",
    );
  }

  return useSWR(`assignments`, () =>
    context.getOneExperiment<T>(experimentId, defaultValue),
  );
}