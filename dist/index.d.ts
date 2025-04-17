import React, { ReactNode } from "react";
import { SWRResponse } from "swr";

//#region \0dts:/Users/josh/myrkt/xavier/src/xavier.d.ts
interface ExperimentAssignment<T> {
	experimentId: string;
	treatmentId: string;
	data: T;
}
type ExperimentAssignments = Map<string, ExperimentAssignment<any>>;
declare class XavierApplication {
	readonly applicationId: string;
	readonly apiToken: string;
	readonly baseUrl: string;
	readonly timeoutMs: number;
	constructor(applicationId: string, apiToken: string, baseUrl?: string, timeoutMs?: number);
	getAllExperiments(): Promise<ExperimentAssignments>;
	getOneExperiment<T>(experimentId: string, defaultValue: T): Promise<T>;
	/***
	* Gets experimentId: treatmentId pairs for all live experiments, suitable
	* for annotating orders placed by users.
	* @returns A map of experimentId to treatmentId
	*/
	getAllExperimentsSummaries(): Promise<Map<string, string>>;
}

//#endregion
//#region \0dts:/Users/josh/myrkt/xavier/src/component.d.ts
interface XavierProviderProps {
	applicationId: string;
	apiToken: string;
	baseUrl?: string;
	children: ReactNode;
}
declare const XavierProvider: React.FC<XavierProviderProps>;
declare const useXavier: () => XavierApplication;

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