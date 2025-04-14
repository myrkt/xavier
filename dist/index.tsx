import React$1 from 'react';
import { ReactNode } from 'react';
import { SWRResponse } from 'swr';

export interface ExperimentAssignment<T> {
	experimentId: string;
	treatmentId: string;
	data: T;
}
export type ExperimentAssignments = Map<string, ExperimentAssignment<any>>;
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
export interface XavierProviderProps {
	applicationId: string;
	apiToken: string;
	baseUrl?: string;
	children: React$1.ReactNode;
}
declare const XavierProvider: React$1.FC<XavierProviderProps>;
export declare const useXavier: () => XavierApplication;
export type XavierResponse<T> = Omit<SWRResponse<T>, "mutate">;
export declare function useExperiment<T = boolean>(experimentId: string, defaultValue: T): XavierResponse<T>;
export declare function useExperimentSummaries(): XavierResponse<Map<string, string>>;

export {
	XavierProvider as default,
};