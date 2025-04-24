import { XavierResponse } from "./responseType";
import { useExperiments } from "./useExperiments";

export function useExperiment<T = boolean>(
  experimentId: string,
  defaultValue: T,
): XavierResponse<T> {
  const allExperiments = useExperiments();

  console.log("useExperiment state:", {
    data: allExperiments.data,
    error: allExperiments.error,
    isLoading: allExperiments.isLoading,
  });

  const result: XavierResponse<T> = {
    ...allExperiments,
    data: allExperiments.data?.get(experimentId)?.data ?? defaultValue,
    error: allExperiments.error,
    isLoading: allExperiments.isLoading,
  };

  return result;
}
