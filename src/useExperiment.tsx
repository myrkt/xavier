import { useXavier } from "./component";
import useSWR, { SWRResponse } from "swr";

export function useExperiment<T = boolean>(
  experimentId: string,
  defaultValue: T,
): SWRResponse<T> {
  const xavier = useXavier();

  return useSWR(`assignments-${experimentId}`, () =>
    xavier.getOneExperiment<T>(experimentId, defaultValue),
  );
}
