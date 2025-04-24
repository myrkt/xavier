"use client";
var import_node_module = require("node:module");
var __create = Object.create;
var __getProtoOf = Object.getPrototypeOf;
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __toESM = (mod, isNodeMode, target) => {
  target = mod != null ? __create(__getProtoOf(mod)) : {};
  const to = isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target;
  for (let key of __getOwnPropNames(mod))
    if (!__hasOwnProp.call(to, key))
      __defProp(to, key, {
        get: () => mod[key],
        enumerable: true
      });
  return to;
};
var __moduleCache = /* @__PURE__ */ new WeakMap;
var __toCommonJS = (from) => {
  var entry = __moduleCache.get(from), desc;
  if (entry)
    return entry;
  entry = __defProp({}, "__esModule", { value: true });
  if (from && typeof from === "object" || typeof from === "function")
    __getOwnPropNames(from).map((key) => !__hasOwnProp.call(entry, key) && __defProp(entry, key, {
      get: () => from[key],
      enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
    }));
  __moduleCache.set(from, entry);
  return entry;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, {
      get: all[name],
      enumerable: true,
      configurable: true,
      set: (newValue) => all[name] = () => newValue
    });
};

// src/index.tsx
var exports_src = {};
__export(exports_src, {
  useXavier: () => useXavier,
  useExperimentSummaries: () => useExperimentSummaries,
  useExperiment: () => useExperiment,
  default: () => src_default,
  XavierApplication: () => XavierApplication
});
module.exports = __toCommonJS(exports_src);

// src/component.tsx
var import_react = __toESM(require("react"));

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
var import_swr = require("swr");
var XavierContext = import_react.createContext(null);
var XavierProvider = ({
  applicationId,
  apiToken,
  baseUrl,
  children
}) => {
  const instance = new XavierApplication(applicationId, apiToken, baseUrl);
  const localStorageKey = `xavier-${applicationId}`;
  return /* @__PURE__ */ import_react.default.createElement(XavierContext.Provider, {
    value: instance
  }, /* @__PURE__ */ import_react.default.createElement(import_swr.SWRConfig, null, children));
};
var useXavier = () => {
  const context = import_react.useContext(XavierContext);
  if (!context) {
    throw new Error("Xavier is not configured. Please add <Xavier apiToken='...'> with a valid token to your component tree.");
  }
  return context;
};

// src/useExperiments.tsx
var import_swr2 = __toESM(require("swr"));
function useExperiments() {
  const xavier = useXavier();
  return import_swr2.default(`assignments-${xavier.applicationId}`, (key) => xavier.getAllExperiments());
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
