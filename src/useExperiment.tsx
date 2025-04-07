import { XavierResponse } from "./responseType";
import { useExperiments } from "./useExperiments";

export function useExperiment<T = boolean>(
  experimentId: string,
  defaultValue: T,
): XavierResponse<T> {
  const allExperiments = useExperiments();

  const result: XavierResponse<T> = {
    ...allExperiments,
    data: allExperiments.data?.get(experimentId)?.data ?? defaultValue
  };

  return result;
}
