import useSWR, { SWRResponse } from "swr";

interface ExperimentAssignment<T> {
  experimentId: string;
  treatment: T;
}

export default class Xavier {
  private static applicationId: string | null = null;
  private static apiToken: string | null = null;
  public static readonly baseUrl: string = "https://assignment.fly.dev/";

  static configure(applicationId: string, apiToken: string) {
    this.applicationId = applicationId;
    this.apiToken = apiToken;
  }

  static getApiToken(): string | null {
    return this.apiToken;
  }

  static getApplicationId(): string | null {
    return this.applicationId;
  }

  static configured(): boolean {
    return this.apiToken !== null && this.applicationId !== null;
  }
}

async function getAllExperiments(): Promise<
  Map<string, ExperimentAssignment<any>>
> {
  if (!Xavier.configured()) {
    throw new Error(
      "API token is not configured. Please call Xavier.configure() with a valid token.",
    );
  }

  const apiToken = Xavier.getApiToken();
  const applicationId = Xavier.getApplicationId();

  const url = `${Xavier.baseUrl}/assignments`;

  const response = await fetch(url, {
    headers: {
      "X-Application-Id": applicationId || "",
      Authorization: `Bearer ${apiToken}`,
    },
  });

  const responseJson = await response.json();

  return new Map(Object.entries(responseJson));
}

async function getOneExperiment<T>(
  experimentId: string,
  defaultValue: T,
): Promise<T> {
  try {
    const allExperiments = await getAllExperiments();
    const experiment = allExperiments.get(experimentId);
    if (experiment) {
      return experiment.treatment;
    }
  } finally {
    // catch all exceptions and return the default value
    return defaultValue;
  }
}

export function useExperiment<T = boolean>(
  experimentId: string,
  defaultValue: T,
): SWRResponse<T> {
  if (!Xavier.configured()) {
    throw new Error(
      "API token is not configured. Please call Xavier.configure() with a valid token.",
    );
  }

  return useSWR(`assignments`, () =>
    getOneExperiment<T>(experimentId, defaultValue),
  );
}
