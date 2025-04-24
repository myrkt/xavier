interface ExperimentAssignment<T> {
  experimentId: string;
  treatmentId: string;
  data: T;
}

interface XavierRequestConfig {
  timeoutMs?: number;
  ipAddress?: string;
}

export type ExperimentAssignments = Map<string, ExperimentAssignment<any>>;

const timeout = (ms: number, promise: Promise<any>) => {
  const controller = new AbortController();
  const signal = controller.signal;

  const timeoutId = setTimeout(() => {
    controller.abort();
  }, ms);

  return promise.finally(() => clearTimeout(timeoutId));
};

const fetchDataWithTimeout = async <T = any>(
  url: string,
  configs: RequestInit,
  ms: number,
): Promise<T> => {
  try {
    const response = await timeout(ms, fetch(url, configs));
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error: any) {
    if (error.name === "AbortError") {
      throw new Error("Request timed out");
    }
    throw error;
  }
};

/**
 * Represents a single logical application for experiment assignment.
 * This class is used to fetch experiment assignments from the Assignment API.
 */
export class XavierApplication {
  constructor(
    /**
     * The application ID used to identify the application, coming from the Myrkt console.
     */
    public readonly applicationId: string,
    /**
     * The API token to authenticate this application with the Assignment API.
     */
    public readonly apiToken: string,
    public readonly baseUrl: string = "https://assignment.fly.dev",

    /**
     * If this timeout is reached, the client will be assigned the default treatment.
     */
    public readonly timeoutMs: number = 500, // default timeout of 500ms
  ) {}

  /**
   * Fetches treatments for all live experiments for this application at once.
   * @param options Specific configuration for this request.
   * @returns A map of experimentId to ExperimentAssignment for each live experiment.
   */
  public async getAllExperiments(
    options?: XavierRequestConfig,
  ): Promise<ExperimentAssignments> {
    const url = `${this.baseUrl}/assignments`;

    const headers: HeadersInit = {
      "X-Application-Id": this.applicationId,
      Authorization: `Bearer ${this.apiToken}`,
    };

    if (options?.ipAddress) {
      headers["X-Forward-Client-IP"] = options.ipAddress;
    }

    const responseJson = await fetchDataWithTimeout(
      url,
      { headers },
      options?.timeoutMs ?? this.timeoutMs,
    );

    return new Map(Object.entries(responseJson)) as ExperimentAssignments;
  }

  /**
   * Gets the treatment for a specific experiment.
   * @param experimentId The ID of the experiment to fetch the assignment for.
   * @param defaultValue The value to use if the experiment is not found or an error occurs.
   * @param options Configuration options for the request.
   * @returns The treatment's associated data or the default value.
   */
  public async getOneExperiment<T>(
    experimentId: string,
    defaultValue: T,
    options?: XavierRequestConfig,
  ): Promise<T> {
    try {
      const allExperiments = await this.getAllExperiments(options);
      const experiment = allExperiments.get(experimentId);
      if (experiment) {
        return experiment.data;
      }
    } catch (e) {
      // catch all exceptions and return the default value
      return defaultValue;
    }

    return defaultValue;
  }

  /***
   * Gets experimentId: treatmentId pairs for all live experiments, suitable
   * for annotating orders placed by users.
   * @returns A map of experimentId to treatmentId
   */
  public async getAllExperimentsSummaries(
    options?: XavierRequestConfig,
  ): Promise<Map<string, string>> {
    const experiments = await this.getAllExperiments(options);
    return new Map(
      experiments.entries().map(([_, v]) => [v.experimentId, v.treatmentId]),
    );
  }
}
