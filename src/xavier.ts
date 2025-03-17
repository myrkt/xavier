interface ExperimentAssignment<T> {
  experimentId: string;
  treatment: T;
}

export type ExperimentAssignments = Map<string, ExperimentAssignment<any>>;

export class XavierApplication {
  constructor(
    public readonly applicationId: string,
    public readonly apiToken: string,
    public readonly baseUrl: string = "https://assignment.fly.dev",
  ) {}

  public async getAllExperiments(): Promise<ExperimentAssignments> {
    const url = `${this.baseUrl}/assignments`;

    const response = await fetch(url, {
      headers: {
        "X-Application-Id": this.applicationId,
        Authorization: `Bearer ${this.apiToken}`,
      },
    });

    const responseJson = await response.json();

    return new Map(Object.entries(responseJson));
  }

  public async getOneExperiment<T>(
    experimentId: string,
    defaultValue: T,
  ): Promise<T> {
    try {
      const allExperiments = await this.getAllExperiments();
      const experiment = allExperiments.get(experimentId);
      if (experiment) {
        return experiment.treatment;
      }
    } catch (e) {
      // catch all exceptions and return the default value
      return defaultValue;
    }

    return defaultValue;
  }
}
