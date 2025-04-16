interface ExperimentAssignment<T> {
  experimentId: string;
  treatmentId: string;
  data: T;
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

export class XavierApplication {
  constructor(
    public readonly applicationId: string,
    public readonly apiToken: string,
    public readonly baseUrl: string = "https://assignment.fly.dev",
    public readonly timeoutMs: number = 500, // default timeout of 500ms
  ) {}

  public async getAllExperiments(): Promise<ExperimentAssignments> {
    const url = `${this.baseUrl}/assignments`;

    const responseJson = await fetchDataWithTimeout(
      url,
      {
        headers: {
          "X-Application-Id": this.applicationId,
          Authorization: `Bearer ${this.apiToken}`,
        },
      },
      this.timeoutMs,
    );

    return new Map(Object.entries(responseJson)) as ExperimentAssignments;
  }

  public async getOneExperiment<T>(
    experimentId: string,
    defaultValue: T,
  ): Promise<T> {
    try {
      const allExperiments = await this.getAllExperiments();
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
  public async getAllExperimentsSummaries(): Promise<Map<string, string>> {
    const experiments = await this.getAllExperiments();
    return new Map(
      experiments.entries().map(([_, v]) => [v.experimentId, v.treatmentId]),
    );
  }
}
