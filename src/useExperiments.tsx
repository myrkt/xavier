import { useXavier } from "./component";
import useSWR from "swr";
import { XavierResponse } from "./responseType";
import { ExperimentAssignments } from "./xavier";

export function useExperiments(): XavierResponse<ExperimentAssignments> {
  const xavier = useXavier();

  const result = useSWR(`assignments-${xavier.applicationId}`, (key) => xavier.getAllExperiments());

  console.log("useExperiments:", result)

  return result
}
