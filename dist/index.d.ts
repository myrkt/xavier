import React, { ReactNode } from "react";
import { SWRResponse } from "swr";

//#region \0dts:/Users/josh/myrkt/xavier/src/xavier.d.ts
interface ExperimentAssignment<T> {
	experimentId: string;
	treatmentId: string;
	data: T;
}
interface XavierRequestConfig {
	timeoutMs?: number;
	ipAddress?: string;
}
type ExperimentAssignments = Map<string, ExperimentAssignment<any>>;
/**
* Represents a single logical application for experiment assignment.
* This class is used to fetch experiment assignments from the Assignment API.
*/
declare class XavierApplication {
	/**
	* The application ID used to identify the application, coming from the Myrkt console.
	*/
	readonly applicationId: string;
	/**
	* The API token to authenticate this application with the Assignment API.
	*/
	readonly apiToken: string;
	readonly baseUrl: string;
	/**
	* If this timeout is reached, the client will be assigned the default treatment.
	*/
	readonly timeoutMs: number;
	constructor(applicationId: string, apiToken: string, baseUrl?: string, timeoutMs?: number);
	/**
	* Fetches treatments for all live experiments for this application at once.
	* @param options Specific configuration for this request.
	* @returns A map of experimentId to ExperimentAssignment for each live experiment.
	*/
	getAllExperiments(options?: XavierRequestConfig): Promise<ExperimentAssignments>;
	/**
	* Gets the treatment for a specific experiment.
	* @param experimentId The ID of the experiment to fetch the assignment for.
	* @param defaultValue The value to use if the experiment is not found or an error occurs.
	* @param options Configuration options for the request.
	* @returns The treatment's associated data or the default value.
	*/
	getOneExperiment<T>(experimentId: string, defaultValue: T, options?: XavierRequestConfig): Promise<T>;
	/***
	* Gets experimentId: treatmentId pairs for all live experiments, suitable
	* for annotating orders placed by users.
	* @returns A map of experimentId to treatmentId
	*/
	getAllExperimentsSummaries(options?: XavierRequestConfig): Promise<Map<string, string>>;
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
export { XavierApplication, XavierProvider as default, useExperiment, useExperimentSummaries, useXavier };