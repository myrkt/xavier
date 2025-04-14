import { XavierResponse } from "./responseType";
import { useExperiments } from "./useExperiments";

export function useExperimentSummaries(
): XavierResponse<Map<string, string>> {
  const allExperiments = useExperiments();

  const result: XavierResponse<Map<string, string>> = {
    ...allExperiments,
    data: new Map((allExperiments.data ?? new Map())?.entries().map(([_, v]) => [v.experimentId, v.treatmentId]))
  };

  return result
}
