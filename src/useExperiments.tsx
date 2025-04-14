import { useXavier } from "./component";
import useSWR from "swr";
import { XavierResponse } from "./responseType";
import { ExperimentAssignments } from "./xavier";

export function useExperiments(): XavierResponse<ExperimentAssignments> {
  const xavier = useXavier();

  return useSWR(`assignments-${xavier.applicationId}`, (key) => xavier.getAllExperiments());
}
