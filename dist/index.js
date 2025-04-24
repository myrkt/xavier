"use client";
// src/component.tsx
import React, { createContext, useContext } from "react";

// src/xavier.ts
var timeout = (ms, promise) => {
  const controller = new AbortController;
  const signal = controller.signal;
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, ms);
  return promise.finally(() => clearTimeout(timeoutId));
};
var fetchDataWithTimeout = async (url, configs, ms) => {
  try {
    const response = await timeout(ms, fetch(url, configs));
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("Request timed out");
    }
    throw error;
  }
};

class XavierApplication {
  applicationId;
  apiToken;
  baseUrl;
  timeoutMs;
  constructor(applicationId, apiToken, baseUrl = "https://assignment.fly.dev", timeoutMs = 500) {
    this.applicationId = applicationId;
    this.apiToken = apiToken;
    this.baseUrl = baseUrl;
    this.timeoutMs = timeoutMs;
  }
  async getAllExperiments(options) {
    const url = `${this.baseUrl}/assignments`;
    const headers = {
      "X-Application-Id": this.applicationId,
      Authorization: `Bearer ${this.apiToken}`
    };
    if (options?.ipAddress) {
      headers["X-Forward-Client-IP"] = options.ipAddress;
    }
    const responseJson = await fetchDataWithTimeout(url, { headers }, options?.timeoutMs ?? this.timeoutMs);
    return new Map(Object.entries(responseJson));
  }
  async getOneExperiment(experimentId, defaultValue, options) {
    try {
      const allExperiments = await this.getAllExperiments(options);
      const experiment = allExperiments.get(experimentId);
      if (experiment) {
        return experiment.data;
      }
    } catch (e) {
      return defaultValue;
    }
    return defaultValue;
  }
  async getAllExperimentsSummaries(options) {
    const experiments = await this.getAllExperiments(options);
    return new Map(experiments.entries().map(([_, v]) => [v.experimentId, v.treatmentId]));
  }
}

// src/component.tsx
import { SWRConfig } from "swr";
var XavierContext = createContext(null);
var NoOpCache = {
  get: () => {
    return;
  },
  set: () => {
    return;
  },
  delete: () => {
    return;
  },
  clear: () => {
    return;
  },
  keys: () => new Map().keys()
};
var XavierProvider = ({
  applicationId,
  apiToken,
  baseUrl,
  children,
  disableCache
}) => {
  const instance = new XavierApplication(applicationId, apiToken, baseUrl);
  const localStorageKey = `xavier-${applicationId}`;
  return /* @__PURE__ */ React.createElement(XavierContext.Provider, {
    value: instance
  }, disableCache ? /* @__PURE__ */ React.createElement(SWRConfig, {
    value: { provider: () => NoOpCache, dedupingInterval: 0 }
  }, children) : /* @__PURE__ */ React.createElement(SWRConfig, null, children));
};
var useXavier = () => {
  const context = useContext(XavierContext);
  if (!context) {
    throw new Error("Xavier is not configured. Please add <Xavier apiToken='...'> with a valid token to your component tree.");
  }
  return context;
};

// src/useExperiments.tsx
import useSWR from "swr";
function useExperiments() {
  const xavier = useXavier();
  return useSWR(`assignments-${xavier.applicationId}`, (key) => xavier.getAllExperiments(), {
    revalidateOnFocus: false,
    shouldRetryOnError: false
  });
}

// src/useExperiment.tsx
function useExperiment(experimentId, defaultValue) {
  const allExperiments = useExperiments();
  console.log("useExperiment state:", {
    data: allExperiments.data,
    error: allExperiments.error,
    isLoading: allExperiments.isLoading
  });
  const result = {
    ...allExperiments,
    data: allExperiments.data?.get(experimentId)?.data ?? defaultValue,
    error: allExperiments.error,
    isLoading: allExperiments.isLoading
  };
  return result;
}
// src/useExperimentSummaries.tsx
function useExperimentSummaries() {
  const allExperiments = useExperiments();
  const result = {
    ...allExperiments,
    data: new Map((allExperiments.data ?? new Map)?.entries().map(([_, v]) => [v.experimentId, v.treatmentId]))
  };
  return result;
}

// src/index.tsx
var src_default = XavierProvider;
export {
  useXavier,
  useExperimentSummaries,
  useExperiment,
  src_default as default,
  XavierApplication
};
