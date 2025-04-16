import React, { ReactNode } from "react";
import { SWRResponse } from "swr";

//#region \0dts:/Users/josh/myrkt/xavier/src/component.d.ts
interface XavierProviderProps {
	applicationId: string;
	apiToken: string;
	baseUrl?: string;
	children: ReactNode;
}
declare const XavierProvider: React.FC<XavierProviderProps>;
declare const useXavier: unknown;

//#endregion
//#region \0dts:/Users/josh/myrkt/xavier/src/responseType.d.ts
type XavierResponse<T> = Omit<SWRResponse<T>, "mutate">;

//#endregion
//#region \0dts:/Users/josh/myrkt/xavier/src/useExperiment.d.ts
declare function useExperiment<T = boolean>(experimentId: string, defaultValue: T): XavierResponse<T>;

//#endregion
//#region \0dts:/Users/josh/myrkt/xavier/src/useExperimentSummaries.d.ts
declare function useExperimentSummaries(): XavierResponse<Map<string, string>>;

//#endregion
export { XavierProvider as default, useExperiment, useExperimentSummaries, useXavier };