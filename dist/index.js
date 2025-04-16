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
  async getAllExperiments() {
    const url = `${this.baseUrl}/assignments`;
    const responseJson = await fetchDataWithTimeout(url, {
      headers: {
        "X-Application-Id": this.applicationId,
        Authorization: `Bearer ${this.apiToken}`
      }
    }, this.timeoutMs);
    return new Map(Object.entries(responseJson));
  }
  async getOneExperiment(experimentId, defaultValue) {
    try {
      const allExperiments = await this.getAllExperiments();
      const experiment = allExperiments.get(experimentId);
      if (experiment) {
        return experiment.data;
      }
    } catch (e) {
      return defaultValue;
    }
    return defaultValue;
  }
  async getAllExperimentsSummaries() {
    const experiments = await this.getAllExperiments();
    return new Map(experiments.entries().map(([_, v]) => [v.experimentId, v.treatmentId]));
  }
}

// src/component.tsx
import { SWRConfig } from "swr";
var XavierContext = createContext(null);
var XavierProvider = ({
  applicationId,
  apiToken,
  baseUrl,
  children
}) => {
  const instance = new XavierApplication(applicationId, apiToken, baseUrl);
  const localStorageKey = `xavier-${applicationId}`;
  return /* @__PURE__ */ React.createElement(XavierContext.Provider, {
    value: instance
  }, /* @__PURE__ */ React.createElement(SWRConfig, null, children));
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
  return useSWR(`assignments-${xavier.applicationId}`, (key) => xavier.getAllExperiments());
}

// src/useExperiment.tsx
function useExperiment(experimentId, defaultValue) {
  const allExperiments = useExperiments();
  const result = {
    ...allExperiments,
    data: allExperiments.data?.get(experimentId)?.data ?? defaultValue
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
  src_default as default
};
